const maps = require('../modules/db/maps');
const cache = require('./cache');

module.exports = class dbwrapper {
    debug = false;
    connection = null;
    table = null;
    map = null;
    tables = null;
    query = {
        select: '',
        from: '',
        where: '',
        has: {},
        orderBy: '',
        limitOffset: '',
        groupBy: '',
        hasProp: {},
        props: [],
        joins: [],
        result: false,
    };
    pagination = {
        onlyLimit: false,
        all: 0,
        page: 1,
        itemsPerPage: 10,
        offset: 0,
        maxPages: 0,
    }
    extfilter = {};
    extSelect = [];
    promises = [];

    constructor(tableName, connection, debug = false) {
        if (!tableName) {
            throw new Error('не задана таблица')
        }
        if (!connection) {
            throw new Error('не передано подключение')
        }
        this.debug = debug;
        this.connection = connection;
        this.table = tableName;
        this.query.from = `FROM ${this.table}`;
        if (!maps.hasOwnProperty(this.table)) {
            throw new Error('Для таблицы не задана мапа')
        }
        this.map = maps[this.table].map;
        this.tables = maps[this.table].tables;
        if (this.debug) {
            console.log('table', this.table)
            console.log('map', this.map)
            console.log('tables', this.tables)
        }
    }

    getMapRaw() {
        let map = {}
        for (const [k, v] of Object.entries(this.map)) {
            map[k] = v.item;
        }
        return map;
    }

    selectValue(select = [], filter = {}, hasTest = []) {
        this.extfilter = JSON.parse(JSON.stringify(filter))
        const map = this.getMapRaw()
        let result = [];
        hasTest.map(v => this.query.has[v] = true)
        if (select.length) {
            hasTest.map(v => this.query.has[v] = false)
            if (!select.includes('id') && map.hasOwnProperty('id')) {
                select.push(map.id)
            }
            for (const [k, v] of Object.entries(map)) {
                if (select.includes(k)) {
                    result.push(`${v} as \`${k}\``)
                }
            }
        }
        if (!result.length) {
            for (const [k, v] of Object.entries(map)) {
                result.push(`${v} as \`${k}\``)
                select.push(k)
            }
        }
        select.map(v => {
            this.query.has[v] = true
        })
        this.extSelect = JSON.parse(JSON.stringify(select))
        this.query.select = !result.length ? '*' : result.join(',');
        const whereFilter = this.createFilter(filter, map, select);
        this.query.where = !whereFilter.trim() ? '' : ` WHERE ${whereFilter}`
        this.getJoins(select)
        if (this.debug) {
            console.log('queryProps1', this.query);
        }
        return this
    }

    groupBy(options) {
        if (options?.groupBy && Array.isArray(options.groupBy) && options.groupBy.length && this.map.hasOwnProperty(options.groupBy[0])) {
            this.query.orderBy = ` GROUP BY ${this.map[options.groupBy[0]].item} `
            if (this.map[options.groupBy[0]].table && this.tables[this.map[options.groupBy[0]].table].link && !this.query.joins.includes(this.tables[this.map[options.groupBy[0]].table].link)) {
                this.query.joins.push(this.tables[this.map[options.groupBy[0]].table].item)
            }
        }
        return this
    }

    orderBy(options) {
        if (options?.sortBy && Array.isArray(options.sortBy) && options.sortBy.length && this.map.hasOwnProperty(options.sortBy[0])) {
            let order_array = []
            options.sortBy.map((field, ind) => {
                if (this.map.hasOwnProperty(field)) {
                    order_array.push(` ${this.map[field].item} ${options?.sortDesc[ind] ? ' DESC ' : ' ASC '} `)
                    if (this.map[field].table && this.tables[this.map[field].table].link && !this.query.joins.includes(this.tables[this.map[field].table].link)) {
                        this.query.joins.push(this.tables[this.map[options.sortBy[0]].table].item)
                    }
                }
            })
            this.query.orderBy = ` ORDER BY ${order_array.join(',')}`
        }
        return this
    }

    paginate(options) {
        if (this.debug) {
            console.log('paginate', `select count(*) as cnt ${this.query.from} ${this.query.joins.join(' ')} ${this.query.where}`, this.query.props)
        }
        if (options.onlyLimit) {
            this.query.limitOffset = ` limit ? `
            this.pagination.onlyLimit = true
        } else {
            let cachePaginationName = cache.createHash(JSON.stringify({
                props: this.query.props,
                query: `select count(*) as cnt ${this.query.from} ${this.query.joins.join(' ')} ${this.query.where}`
            }))
            let cacheData = cache.get(cachePaginationName)
            if (cacheData) {
                this.pagination.all = cacheData.cnt;
                this.pagination.itemsPerPage = options.itemsPerPage || this.pagination.itemsPerPage
                this.pagination.maxPages = Math.ceil(this.pagination.all / this.pagination.itemsPerPage)
                this.pagination.page = Math.max(1, Math.min(options.page || this.pagination.page, this.pagination.maxPages))
                this.pagination.offset = this.pagination.itemsPerPage * (this.pagination.page - 1)
                this.query.limitOffset = ` limit ? offset ? `
            } else {
                this.promises.push(
                    this.connection.query(`select count(*) as cnt ${this.query.from} ${this.query.joins.join(' ')} ${this.query.where}`, this.query.props)
                        .then(([res]) => {
                            this.pagination.all = res.cnt;
                            this.pagination.itemsPerPage = options.itemsPerPage || this.pagination.itemsPerPage
                            this.pagination.maxPages = Math.ceil(this.pagination.all / this.pagination.itemsPerPage)
                            if (this.pagination.maxPages > 10) {
                                cache.set(cachePaginationName, res, 60 * 1000)
                            }
                            this.pagination.page = Math.max(1, Math.min(options.page || this.pagination.page, this.pagination.maxPages))
                            this.pagination.offset = this.pagination.itemsPerPage * (this.pagination.page - 1)
                            this.query.limitOffset = ` limit ? offset ? `
                        })
                )
            }
        }
        return this
    }

    runQuery() {
        return Promise.all(this.promises)
            .then(() => {
                if (this.query.limitOffset) {
                    this.query.props.push(this.pagination.itemsPerPage)
                    if (!this.pagination.onlyLimit) {
                        this.query.props.push(this.pagination.offset)
                    }
                }
                if (this.debug) {
                    console.log('queryProps2', this.query);
                    console.log('query', `select ${this.query.select} ${this.query.from} ${this.query.joins.join(' ')} ${this.query.where} ${this.query.orderBy} ${this.query.limitOffset}`, this.query.props)
                }
            })
            .then(() => this.connection.query(`select ${this.query.select} ${this.query.from} ${this.query.joins.join(' ')} ${this.query.where} ${this.query.orderBy} ${this.query.limitOffset}`, this.query.props))
            .then(queryResult => this.query.result = queryResult)
            .then(() => this.openJsonProps())
            .then(() => ({queryResult: this.query.result, has: this.query.has, pagination: this.pagination}))
    }

    getJoins(select) {
        this.query.joins = Array.from(select.reduce((a, v) => {
            if (this.map.hasOwnProperty(v)) {
                let t = this.map[v].table
                if (!t) return a;
                if (this.tables[t].link) {
                    a.add(this.tables[this.tables[t].link].item)
                }
                a.add(this.tables[t].item)
            }
            return a
        }, new Set()))
    }

    createFilter(filter = {}, map = {}, selectArr) {
        let logic = 'AND';
        let w = [];
        let filtersHard = []
        if (Object.keys(filter).length) {
            for (let [k, v] of Object.entries(filter)) {
                if (k === 'logic') {
                    logic = v
                } else {
                    if (typeof v === 'object' && Number.isInteger(parseInt(k))) {
                        filtersHard.push(v)
                    } else {
                        const eq = [k.substr(0, 1), k.substr(1, 1)]
                        k = k.replace(/^[%!&$><=]+/gi, '')
                        if (!selectArr.includes(k)) {
                            selectArr.push(k)
                        }
                        if (map.hasOwnProperty(k)) {
                            if (eq[0] === '&' && Array.isArray(v)) {
                                if (this.map[k].type === 'json') {
                                    let tmp = []
                                    v.map(val => {
                                        tmp.push(`JSON_CONTAINS(${map[k]},?)`)
                                        this.query.props.push(val)
                                    })
                                    w.push(`(${tmp.join(" OR ")})`)
                                } else {
                                    this.query.props.push(v)
                                    w.push(`${map[k]} in (?)`)
                                }
                            } else if (eq[0] === '$' && Array.isArray(v)) {
                                if (this.map[k].type === 'json') {
                                    let tmp = []
                                    v.map(val => {
                                        tmp.push(`JSON_CONTAINS(${map[k]},?)=0`)
                                        this.query.props.push(val)
                                    })
                                    w.push(`(${tmp.join(" OR ")})`)
                                } else {
                                    this.query.props.push(v)
                                    w.push(`${map[k]} not in (?)`)
                                }
                            } else if (eq[0] === '%') {
                                this.query.props.push(`%${v}%`)
                                w.push(`${map[k]} like ?`)
                            } else if (eq[0] === '!') {
                                if (this.map[k].type === 'json') {
                                    w.push(`JSON_CONTAINS(${map[k]},?)=0`)
                                    this.query.props.push(v)
                                } else {
                                    if (eq[1] === '!') {
                                        w.push(`${map[k]} is not null`)
                                    } else {
                                        this.query.props.push(v)
                                        w.push(`${map[k]} <> ?`)
                                    }
                                }
                            } else if (eq[0] === '<') {
                                if (this.map[k].type === 'json') {
                                    continue;
                                } else {
                                    this.query.props.push(v)
                                    if (eq[1] === '=') {
                                        w.push(`${map[k]} <= ?`)
                                    } else {
                                        w.push(`${map[k]} < ?`)
                                    }
                                }
                            } else if (eq[0] === '>') {
                                if (this.map[k].type === 'json') {
                                    continue;
                                } else {
                                    this.query.props.push(v)
                                    if (eq[1] === '=') {
                                        w.push(`${map[k]} >= ?`)
                                    } else {
                                        w.push(`${map[k]} > ?`)
                                    }
                                }
                            } else {
                                if (this.map[k].type === 'json') {
                                    w.push(`JSON_CONTAINS(${map[k]},?)`)
                                    this.query.props.push(v)
                                } else {
                                    this.query.props.push(v)
                                    w.push(`${map[k]} = ?`)
                                }
                            }
                        }
                    }
                }
            }
        }
        filtersHard.forEach(v => {
            const newFilter = this.createFilter(v, map, selectArr);
            if (!!newFilter) {
                w.push(newFilter)
            }
        })
        const whereFilter = !w.length ? '' : ` ( ${w.join(` ${logic} `)} ) `
        return whereFilter
    }

    openJsonProps() {
        let jsons = this.extSelect.reduce((acc, k) => {
            if (this.map.hasOwnProperty(k) && this.map[k].type === 'json') {
                acc.push(k)
            }
            return acc;
        }, [])
        this.query.result.forEach(v => jsons.forEach(k => typeof v[k] !== 'object' && (v[k] = JSON.parse(v[k]))))
    }
}
