const logger = require('../../../modules/logger');
const fs = require('fs')
const templates = {};

templates.list = async () => {
    let connection;
    let res;
    try {
        connection = await process.dbPool.connection();
        res = await connection.query("SELECT `templates`.`name`,`templates`.`type` as `type_id`,`templates`.`active`,`templates`.`img`,`template_types`.`name` as `type_name`,`templates`.`id`  FROM `templates` INNER JOIN `template_types` on `templates`.`type`=`template_types`.`id` where `active`=1");
        res = await reabaseElem(res)
    } catch (err) {
        logger.error(err, 'templates.list:');
        throw err;
    } finally {
        if (connection) await connection.release();
    }
    return res
};
templates.byId = async (id,conn) => {
    let connection;
    let res;
    try {
        connection = conn || await process.dbPool.connection();
        res = await connection.query("SELECT `templates`.`name`,`templates`.`type` as `type_id`,`templates`.`active`,`templates`.`img`,`template_types`.`name` as `type_name`,`templates`.`id`  FROM `templates` INNER JOIN `template_types` on `templates`.`type`=`template_types`.`id` where `templates`.`active`=1 and `templates`.`id`=?",[id]);
        res = await reabaseElem(res,true)
    } catch (err) {
        logger.error(err, 'templates.byId:');
        throw err;
    } finally {
        if (!conn && connection) await connection.release();
    }
    return res
};
async function reabaseElem(res,withData=false) {
    if (res && res.length) {
        return res.map(el => {
            if (withData) {
                let templateData = {}
                let templateDataPath = `./upload/templates/${el.id}/template.json`
                console.log(templateDataPath)
                if (fs.existsSync(templateDataPath)) {
                    templateData = JSON.parse(fs.readFileSync(templateDataPath, 'utf8')) || {}
                }
                el = Object.assign(templateData,el)
            }
            return el
        })
    } else {
        return res
    }
}
module.exports = templates;
