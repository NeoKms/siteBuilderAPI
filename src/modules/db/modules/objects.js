const logger = require('../../../modules/logger');
const objects = {};

objects.list = async () => {
    let connection;
    let res;
    try {
        connection = await process.dbPool.connection();
        res = await connection.query("SELECT `id`,`name` from `object` where `active`=1");
    } catch (err) {
        logger.error(err, 'objects.list:');
        throw err;
    } finally {
        if (connection) await connection.release();
    }
    return res
};
module.exports = objects;
