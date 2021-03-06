const logger = require('../../../modules/logger');
const fs = require('fs')
const sites = {};

sites.siteList = async () => {
    let connection;
    let res;
    try {
        connection = await process.dbPool.connection();
        res = await connection.query("SELECT `id`,`type_id`,`name`,`active`,`img`,`address` FROM `sites` ");
        res = await reabaseSite(res,connection)
    } catch (err) {
        logger.error(err, 'sites.siteList:');
        throw err;
    } finally {
        if (connection) await connection.release();
    }
    return res
};
sites.getSite = async (id) => {
    let connection;
    let res;
    try {
        connection = await process.dbPool.connection();
        res = await connection.query("SELECT * FROM `sites` where `id`=?",[id]);
        res = await reabaseSite(res,connection)
        res = res[0]
    } catch (err) {
        logger.error(err, 'sites.getSite:');
        throw err;
    } finally {
        if (connection) await connection.release();
    }
    return res
};
async function reabaseSite(res,connection) {
    if (res && res.length) {
        let types = await connection.query("select `id` as `value`,`name` as `label`,`code` from `site_types`")
        return res.map(el => {
            if ('contacts' in el) {
                el.contacts = JSON.parse(el.contacts)
            }
            if ('template_id' in el) {
                let templateData = {}
                let templateDataPath = `./upload/sites/templateData_${el.id}.json`
                if (el.template_id>0 && fs.existsSync(templateDataPath)) {
                    templateData = JSON.parse(fs.readFileSync(templateDataPath,'utf8')) || {}
                }
                el.template = {
                    id: el.template_id,
                    data: templateData
                }
            }
            if ('type_id' in el) {
                el.type = {
                    options: types,
                    value: el.type_id
                }
            }
            return el
        })
    } else {
        return res
    }
}
module.exports = sites;
