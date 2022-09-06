const logger = require("../../../modules/logger");
const db = require("../connect");
const fs = require("fs");
const DBWrapper = require("../../DBWrapper");

module.exports = class Templates {
  externalDB = {};

  setExternalDB(external) {
    this.externalDB = external;
  }

  async __filter({select = [], filter = {}, hasarr = [], options = {}}, con) {
    let connection, res = {};
    try {
      connection = await con || db.connection();
      res = await new DBWrapper("templates", connection, false).selectValue(select, filter, hasarr).orderBy(options).paginate(options).runQuery();
      if (Object.keys(res.has).length) {
        for (let i = 0, c = res.queryResult.length; i < c; i++) {
          let item = res.queryResult[i];
          if (res.has.templateData) {
            let templateData = {};
            let templateDataPath = `./upload/templates/${item.id}/template.json`;
            if (fs.existsSync(templateDataPath)) {
              templateData = JSON.parse(fs.readFileSync(templateDataPath, "utf8")) || {};
            }
            item = Object.assign(item,templateData);
          }
        }
      }
    } catch (err) {
      logger.error(err, "templates.__filter:");
      throw err;
    } finally {
      if (connection && !con) await connection.release();
    }
    return res;
  }

  async list() {
    let connection;
    let res;
    try {
      connection = await db.connection();
      res = this.__filter({
        select: ["name", "type_id", "active", "img", "type_name", "id"],
        filter: {"active": 1},
      }, connection).then(({queryResult}) => queryResult);
    } catch (err) {
      logger.error(err, "templates.list:");
      throw err;
    } finally {
      if (connection) await connection.release();
    }
    return res;
  }

  async byId(id, conn) {
    let connection;
    let res;
    try {
      connection = conn || await db.connection();
      res = this.__filter({
        select: ["name", "type_id", "active", "img", "type_name", "id","templateData"],
        filter: {"active": 1, "id": id},
        hasarr: ["templateData"]
      }, connection).then(({queryResult}) => queryResult);
    } catch (err) {
      logger.error(err, "templates.byId:");
      throw err;
    } finally {
      if (!conn && connection) await connection.release();
    }
    return res;
  }
};
