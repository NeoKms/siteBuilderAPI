const logger = require('../../../modules/logger');

const user = {};

user.getAuth = async (userData) => {
    let connection;
    let res = false;
    try {
        connection = await process.dbPool.connection();
        res = await connection.query("SELECT `id`, `login` as `name`, `rights`, `email`, `phone`, `fio`  FROM `users` WHERE (`login` = ? or `phone` = ?) AND `password` = ?", [userData.username, userData.username, userData.password])
        if (res && res.length > 0) {
            res = res[0]
        } else {
            return false
        }
    } catch (err) {
        logger.error(err, 'user.getAuth:');
        throw err;
    } finally {
        if (connection) await connection.release();
    }
    return res
};

module.exports = user;
