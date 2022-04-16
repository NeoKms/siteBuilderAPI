const logger = require('../../../modules/logger');
const db = require('../connect');

module.exports = class Publications {
    externalDB = {}

    setExternalDB(external) {
        this.externalDB = external
    }

    async list() {
        let connection;
        let res;
        try {
            connection = await db.connection();
            res = await connection.query("SELECT `id`,`name`,`sqr`,`destination`,`date`,`rate` from `publication` where `active`=1");
        } catch (err) {
            logger.error(err, 'publications.list:');
            throw err;
        } finally {
            if (connection) await connection.release();
        }
        return res
    }

    async byfilter(req) {
        let connection;
        let res;
        try {
            connection = await db.connection();
            let where = ['`active`=?']
            let params = [1]
            if ('ids' in req && req.ids.length) {
                where.push('`id` in (?)')
                params.push(req.ids)
            }
            if ('sqr' in req && req.sqr.length === 2) {
                if (req.sqr[0] !== '') {
                    where.push('`sqr`>=?')
                    params.push(req.sqr[0])
                }
                if (req.sqr[1] !== '') {
                    where.push('`sqr`<=?')
                    params.push(req.sqr[1])
                }
            }
            if ('rate' in req && req.rate.length === 2) {
                if (req.rate[0] !== '') {
                    where.push('`rate`>=?')
                    params.push(req.rate[0])
                }
                if (req.rate[1] !== '') {
                    where.push('`rate`<=?')
                    params.push(req.rate[1])
                }
            }
            if ('object_id' in req && req.object_id !== -1) {
                where.push('`object_id`=?')
                params.push(req.object_id)
            }
            if ('liter_id' in req && req.liter_id !== -1) {
                where.push('`liter_id`=?')
                params.push(req.liter_id)
            }
            if ('types' in req) {
                let accessTypes = ['warehouse', 'office', 'manufacture']
                for (let i = 0; i < req.types.length; i++) {
                    let type = req.types[i]
                    if (accessTypes.includes(type)) {
                        where.push(`\`${type}\`=1`)
                    }
                }
            }
            let fields = '`id`,`name`,`sqr`,`destination`,`date`,`rate`'
            if ('build' in req) {
                fields = '*'
            }
            res = await connection.query("SELECT " + fields + " from `publication` where " + where.join(' AND '), params);
        } catch (err) {
            logger.error(err, 'publications.byfilter:');
            throw err;
        } finally {
            if (connection) await connection.release();
        }
        return res
    }

    async setOnSite(arr, id, conn) {
        let connection;
        let res;
        try {
            connection = conn || await db.connection();
            let resNow = await connection.query("SELECT `publ_id` from `site_publications` where `site_id`=?", [id]);
            resNow = resNow.map(el => el.publ_id)
            let onDel = resNow.filter(el => !arr.includes(el))
            if (onDel.length) {
                await connection.query("delete from `site_publications` where `publ_id` in (?) and `site_id`=?", [onDel, id]);
            }
            let onInsert = arr.filter(el => !resNow.includes(el))
            onInsert = onInsert.map(el => [el, id])
            if (onInsert.length) {
                await connection.query("insert into  `site_publications` (`publ_id`,`site_id`) values ?", [onInsert]);
            }
        } catch (err) {
            logger.error(err, 'publications.setOnSite:');
            throw err;
        } finally {
            if (connection && !conn) await connection.release();
        }
        return res
    }
}
