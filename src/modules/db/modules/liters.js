const logger = require("../../../modules/logger");
const db = require("../connect");
const DBWrapper = require("../../DBWrapper");

module.exports = class Liters {
  externalDB = {};

  setExternalDB(external) {
    this.externalDB = external;
  }

  async __filter({select = [], filter = {}, hasarr = [], options = {}}, con) {
    let connection, res = {};
    try {
      connection = await con || db.connection();
      res = await new DBWrapper("liter", connection, false).selectValue(select, filter, hasarr).orderBy(options).paginate(options).runQuery();
    } catch (err) {
      logger.error(err, "liters.__filter:");
      throw err;
    } finally {
      if (connection && !con) await connection.release();
    }
    return res;
  }

  async list() {
    let connection, res;
    try {
      connection = await db.connection();
      res = await this.__filter({select: ["id", "name"], filter: {"active": 1}}, connection)
        .then(({queryResult})=>queryResult);
    } catch (err) {
      logger.error(err, "liters.list:");
      throw err;
    } finally {
      if (connection) await connection.release();
    }
    return res;
  }

  async byIds(ids) {
    let connection, res;
    try {
      connection = await db.connection();
      res = await this.__filter({filter: {"active": 1, "&id": ids}}, connection)
        .then(({queryResult})=>queryResult);
    } catch (err) {
      logger.error(err, "liters.byIds:");
      throw err;
    } finally {
      if (connection) await connection.release();
    }
    return res;
  }
};
