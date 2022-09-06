const logger = require("../../../modules/logger");
const db = require("../connect");
const DBWrapper = require("../../DBWrapper");

module.exports = class User {
  externalDB = {};

  setExternalDB(external) {
    this.externalDB = external;
  }

  async __filter({select = [], filter = {}, hasarr = [], options = {}}, con) {
    let connection, res = {};
    try {
      connection = await con || db.connection();
      res = await new DBWrapper("users", connection, false).selectValue(select, filter, hasarr).orderBy(options).paginate(options).runQuery();
    } catch (err) {
      logger.error(err, "users.__filter:");
      throw err;
    } finally {
      if (connection && !con) await connection.release();
    }
    return res;
  }

  async getAuth(userData) {
    let connection;
    let res = false;
    try {
      connection = await db.connection();
      res = await this.__filter({
        select: ["id", "name", "rights", "email", "phone", "fio"],
        filter: {
          "0": {
            "logic": "OR",
            "name": userData.username,
            "phone": userData.username
          },
          "password": userData.password
        }
      }, connection)
        .then(({queryResult}) => queryResult);
      if (res && res.length > 0) {
        res = res[0];
      } else {
        return false;
      }
    } catch (err) {
      logger.error(err, "user.getAuth:");
      throw err;
    } finally {
      if (connection) await connection.release();
    }
    return res;
  }
};

