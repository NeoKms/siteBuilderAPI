const logger = require('../../../modules/logger');
const publications = {};

publications.list = async () => {
    let connection;
    let res;
    try {
        connection = await process.dbPool.connection();
        res = await connection.query("SELECT `id`,`name`,`sqr`,`destination`,`date` from `publication` where `active`=1");
    } catch (err) {
        logger.error(err, 'objects.list:');
        throw err;
    } finally {
        if (connection) await connection.release();
    }
    return res
};
publications.byfilter = async (req) => {
    let connection;
    let res;
    try {
        connection = await process.dbPool.connection();
        let where = ['`active`=?']
        let params = [1]
        if ('ids' in req) {
            where.push('`id` in (?)')
            params.push(req.ids)
        }
        if ('sqr' in req && req.sqr.length===2) {
            where.push('`sqr`>=? AND `sqr`<=?')
            params.push(req.sqr[0])
            params.push(req.sqr[1])
        }
        if ('object_id' in req) {
            where.push('`object_id`=?')
            params.push(req.object_id)
        }
        if ('liter_id' in req) {
            where.push('`liter_id`=?')
            params.push(req.liter_id)
        }
        console.log("SELECT `id`,`name`,`sqr`,`destination`,`date` from `publication` where "+where.join(' AND '))
        res = await connection.query("SELECT `id`,`name`,`sqr`,`destination`,`date` from `publication` where "+where.join(' AND '),params);
    } catch (err) {
        logger.error(err, 'objects.list:');
        throw err;
    } finally {
        if (connection) await connection.release();
    }
    return res
};
module.exports = publications;
