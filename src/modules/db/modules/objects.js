const logger = require('../../../modules/logger');
const db = require('../connect')
const objects = {};

objects.list = async () => {
    let connection;
    let res;
    try {
        connection = await db.connection();
        res = await connection.query("SELECT `id`,`name` from `object` where `active`=1");
    } catch (err) {
        logger.error(err, 'objects.list:');
        throw err;
    } finally {
        if (connection) await connection.release();
    }
    return res
};
objects.byIds = async (ids) => {
    let connection;
    let res;
    try {
        connection = await db.connection();
        res = await connection.query("SELECT * from `object` where `active`=1 and `id` in (?)",[ids]);
    } catch (err) {
        logger.error(err, 'objects.byIds:');
        throw err;
    } finally {
        if (connection) await connection.release();
    }
    return res
};
module.exports = objects;
