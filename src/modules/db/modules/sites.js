const logger = require('../../../modules/logger');
const db = require('../connect');
const fs = require('fs');
const {getFiles, reinitImgInObj} = require('../../helpers');
const DBWrapper = require("../../DBWrapper");

module.exports = class Sites {
    externalDB = {}

    setExternalDB(external) {
        this.externalDB = external
    }

    async __filterSiteTypes({select = [], filter = {}, hasarr = [], options = {}}, con) {
        let connection, res = {};
        try {
            connection = await con || db.connection();
            res = await new DBWrapper('site_types', connection, false).selectValue(select, filter, hasarr).orderBy(options).paginate(options).runQuery();
        } catch (err) {
            logger.error(err, 'sites.__filterSiteTypes:');
            throw err;
        } finally {
            if (connection && !con) await connection.release();
        }
        return res
    }

    async __filter({select = [], filter = {}, hasarr = [], options = {}}, con) {
        let connection, res = {};
        try {
            connection = await con || db.connection();
            let types = null
            res = await new DBWrapper('sites', connection, false).selectValue(select, filter, hasarr).orderBy(options).paginate(options).runQuery();
            if (Object.keys(res.has).length) {
                for (let i = 0, c = res.queryResult.length; i < c; i++) {
                    let item = res.queryResult[i]
                    if (res.has.type_id && res.has.type) {
                        if (types === null) {
                            types = await this.__filterSiteTypes({}, connection)
                        }
                        item.type.options = types
                    }
                    if (res.has.img) {
                        item.img = item.img || ''
                    }
                    if (res.has.address) {
                        item.address = item.address || ''
                    }
                    if (res.has.contacts) {
                        item.contacts = item.contacts || {
                            "title": "",
                            "phone": "",
                            "city": "",
                            "street": "",
                            "house": "",
                            "litera": "",
                            "index": 0,
                            "emailMain": "",
                            "emailFeedback": "",
                            "doubleMailing": 0,
                            "coordinate": {"x": "", "y": ""}
                        }
                    }
                    if (res.has.template_id) {
                        let templateData = {}
                        let templateDataPath = `./upload/sites/templateData_${item.id}.json`
                        if (item.template_id > 0 && fs.existsSync(templateDataPath)) {
                            templateData = JSON.parse(fs.readFileSync(templateDataPath, 'utf8')) || {}
                        }
                        item.template = templateData
                    }

                    if (res.has.oneSite && res.has.template_id) {
                        item.publications = await this.externalDB.publications.__filterSitePubl({
                            select: ['publ_id'],
                            filter: {
                                'site_id': item.id
                            }
                        }, connection).then(({queryResult}) => queryResult)
                        item.publications.forEach(el => {
                            el.id = el.publ_id;
                            delete el.id
                        })
                        if (res.has.build) {
                            const files = await getFiles(`upload/templates/${item.template_id}/`);
                            item.download = [
                                {
                                    name: `site.settings.json`,
                                    path: `upload/sites/templateData_${item.id}.json`
                                },
                                {
                                    name: 'template.json',
                                    path: `upload/templates/${item.template_id}/template.json`
                                },
                                ...files
                            ]
                        }
                    }
                }
            }
        } catch (err) {
            logger.error(err, 'sites.__filter:');
            throw err;
        } finally {
            if (connection && !con) await connection.release();
        }
        return res
    }

    async siteList() {
        let connection;
        let res;
        try {
            connection = await db.connection();
            res = await this.__filter({
                select: [`id`, `type_id`, `name`, `active`, `img`, `address`, `processing`, 'type'],
            }, connection).then(({queryResult}) => queryResult)
        } catch (err) {
            logger.error(err, 'sites.siteList:');
            throw err;
        } finally {
            if (connection) await connection.release();
        }
        return res
    };

    async getSite(id, build = false) {
        let connection;
        let res;
        try {
            connection = await db.connection();
            let hasarr = ['onSite']
            if (build) {
                hasarr.push('build')
            }
            [res] = await this.__filter({filter:{id}},connection)
                .then(({queryResult})=>queryResult)
        } catch (err) {
            logger.error(err, 'sites.getSite:');
            throw err;
        } finally {
            if (connection) await connection.release();
        }
        return res
    };

    async setSite(data) {
        let connection;
        let res;
        try {
            connection = await db.connection();
            data = await this.prepareToSave(data, connection)
            res = await connection.query("update `sites` set " + data[0].join(',') + " where `id`=?", data[1]);
        } catch (err) {
            logger.error(err, 'sites.setSite:');
            throw err;
        } finally {
            if (connection) await connection.release();
        }
        return res
    };

    async newSite(name) {
        let connection;
        let res;
        try {
            connection = await db.connection();
            let [id] = await connection.query("insert into `sites` (`name`) values (?) returning id", [name]);
            res = id.id
        } catch (err) {
            logger.error(err, 'sites.newSite:');
            throw err;
        } finally {
            if (connection) await connection.release();
        }
        return res
    };

    async delSite(id) {
        let connection;
        try {
            connection = await db.connection();
            await connection.query("delete from `sites` where `id`=?", [id]);
        } catch (err) {
            logger.error(err, 'sites.delSite:');
            throw err;
        } finally {
            if (connection) await connection.release();
        }
    };

    async setProcessing(id, val) {
        let connection;
        try {
            connection = await db.connection();
            await connection.query("update `sites` set `processing`=? where `id`=?", [val, id]);
        } catch (err) {
            logger.error(err, 'sites.setProcessing:');
            throw err;
        } finally {
            if (connection) await connection.release();
        }
    };

    async changeActive(id, val, processing = 0) {
        let connection;
        try {
            connection = await db.connection();
            await connection.query("update `sites` set `active`=?, `processing`=? where `id`=?", [val, processing, id]);
        } catch (err) {
            logger.error(err, 'sites.changeActive:');
            throw err;
        } finally {
            if (connection) await connection.release();
        }
    };

    async prepareToSave(data, conn) {
        let props = [
            'active', 'address', 'description', 'name',
        ]
        let toUpd = []
        let params = []
        for (let prop in data) {
            if (prop === 'contacts') {
                toUpd.push('`contacts`=?')
                params.push(JSON.stringify(data[prop]))
            } else if (prop === 'template' && data[prop].id > 0) {
                toUpd.push('`template_id`=?')
                params.push(data[prop].id)
                let siteProps = {
                    name: data.name || '',
                    address: 'THIS IS ADDRESS',
                    contacts: data.contacts || {
                        "title": "",
                        "phone": "",
                        "city": "",
                        "street": "",
                        "house": "",
                        "litera": "",
                        "index": 0,
                        "emailMain": "",
                        "emailFeedback": "",
                        "doubleMailing": 0,
                        "coordinate": {"x": "", "y": ""}
                    },
                    api_keys: {yandex_metrica: '', google_metrica: '', verbox: '', recaptcha_public: '',},
                }
                if (!('pages' in data[prop])) {
                    let tmplData = await this.externalDB.templates.byId(data[prop].id, conn)
                    let settings = tmplData[0]
                    settings.siteProps = siteProps;
                    fs.writeFileSync(`./upload/sites/templateData_${data.id}.json`, JSON.stringify(settings))
                } else {
                    data[prop].siteProps = siteProps;
                    data[prop] = reinitImgInObj(data[prop])
                    fs.writeFileSync(`./upload/sites/templateData_${data.id}.json`, JSON.stringify(data[prop]))
                }
            } else if (prop === 'type') {
                toUpd.push('`type_id`=?')
                params.push(data[prop].value)
            } else if (prop === 'publications') {
                await this.externalDB.publications.setOnSite(data[prop].map(el => el.id), data.id, conn)
            } else if (props.includes(prop)) {
                toUpd.push(`\`${prop}\`=?`)
                params.push(data[prop])
            }
        }
        params.push(data.id)
        return [toUpd, params]
    }
}
