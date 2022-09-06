const logger = require("../../../modules/logger");
const db = require("../connect");
const DBWrapper = require("../../DBWrapper");

module.exports = class Publications {
  externalDB = {};

  setExternalDB(external) {
    this.externalDB = external;
  }

  async __filterSitePubl({select = [], filter = {}, hasarr = [], options = {}}, con) {
    let connection, res = {};
    try {
      connection = await con || db.connection();
      res = await new DBWrapper("site_publications", connection, false).selectValue(select, filter, hasarr).orderBy(options).paginate(options).runQuery();
    } catch (err) {
      logger.error(err, "publications.__filterSitePubl:");
      throw err;
    } finally {
      if (connection && !con) await connection.release();
    }
    return res;
  }

  async __filter({select = [], filter = {}, hasarr = [], options = {}}, con) {
    let connection, res = {};
    try {
      connection = await con || db.connection();
      res = await new DBWrapper("publication", connection, false).selectValue(select, filter, hasarr).orderBy(options).paginate(options).runQuery();
    } catch (err) {
      logger.error(err, "publications.__filter:");
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
      res = await this.__filter({
        select: [
          "id", "name", "sqr", "destination", "date", "rate"
        ],
        filter: {
          "active": 1
        }
      }, connection).then(({queryResult}) => queryResult);
    } catch (err) {
      logger.error(err, "publications.list:");
      throw err;
    } finally {
      if (connection) await connection.release();
    }
    return res;
  }

  async byfilter(req={}) {
    let connection;
    let res;
    try {
      connection = await db.connection();
      let filter = {
          "active": 1
        }, select = ["id", "name", "sqr", "destination", "date", "rate"], hasarr = [];
      if ("ids" in req && req.ids.length) {
        filter["&id"] = req.ids;
      }
      if ("sqr" in req && req.sqr.length === 2) {
        if (req.sqr[0] !== "") {
          filter[">=sql"] = req.sqr[0];
        }
        if (req.sqr[1] !== "") {
          filter["<=sql"] = req.sqr[1];
        }
      }
      if ("rate" in req && req.rate.length === 2) {
        if (req.rate[0] !== "") {
          filter[">=rate"] = req.rate[0];
        }
        if (req.rate[1] !== "") {
          filter[">=rate"] = req.rate[1];
        }
      }
      if ("object_id" in req && req.object_id !== -1) {
        filter["object_id"] = req.object_id;
      }
      if ("liter_id" in req && req.liter_id !== -1) {
        filter["liter_id"] = req.liter_id;
      }
      if ("types" in req) {
        let accessTypes = ["warehouse", "office", "manufacture"];
        for (let i = 0; i < req.types.length; i++) {
          let type = req.types[i];
          if (accessTypes.includes(type)) {
            filter[type] = 1;
          }
        }
      }
      if ("build" in req) {
        select = [];
      }
      res = await this.__filter({select, filter, hasarr}, connection).then(({queryResult}) => queryResult);
    } catch (err) {
      logger.error(err, "publications.byfilter:");
      throw err;
    } finally {
      if (connection) await connection.release();
    }
    return res;
  }

  async setOnSite(arr, id, conn) {
    let connection;
    try {
      connection = conn || await db.connection();
      let resNow = await this.__filterSitePubl({select: ["publ_id"],filter: {site_id: id}})
        .then(({queryResult})=>queryResult);
      resNow = resNow.map(el => el.publ_id);
      let onDel = resNow.filter(el => !arr.includes(el));
      if (onDel.length) {
        await connection.query("delete from `site_publications` where `publ_id` in (?) and `site_id`=?", [onDel, id]);
      }
      let onInsert = arr.filter(el => !resNow.includes(el));
      onInsert = onInsert.map(el => [el, id]);
      if (onInsert.length) {
        await connection.query("insert into  `site_publications` (`publ_id`,`site_id`) values ?", [onInsert]);
      }
    } catch (err) {
      logger.error(err, "publications.setOnSite:");
      throw err;
    } finally {
      if (connection && !conn) await connection.release();
    }
  }
};
