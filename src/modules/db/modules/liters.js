const logger = require('../../../modules/logger');
const liters = {};

liters.list = async () => {
    let connection;
    let res;
    try {
        connection = await process.dbPool.connection();
        res = await connection.query("SELECT `id`,`name` from `liter` where `active`=1");
    } catch (err) {
        logger.error(err, 'liters.list:');
        throw err;
    } finally {
        if (connection) await connection.release();
    }
    return res
};
module.exports = liters;
