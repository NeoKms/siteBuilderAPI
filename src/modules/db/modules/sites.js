const logger = require('../../../modules/logger');
const fs = require('fs')
const template = require('./templates')
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
sites.setSite = async (data) => {
    let connection;
    let res;
    try {
        connection = await process.dbPool.connection();
        data = await prepareToSave(data,connection)
        res = await connection.query("update `sites` set "+data[0].join(',')+" where `id`=?",data[1]);
    } catch (err) {
        logger.error(err, 'sites.getSite:');
        throw err;
    } finally {
        if (connection) await connection.release();
    }
    return res
}
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
                delete el.template_id
            }
            if ('type_id' in el) {
                el.type = {
                    options: types,
                    value: el.type_id
                }
                delete el.type_id
            }
            return el
        })
    } else {
        return res
    }
}
async function prepareToSave(data,conn) {
    let props = [
        'active','address','description','name',
    ]
    let toUpd = []
    let params = []
    for (let prop in data) {
        if (prop==='contacts') {
            toUpd.push('`contacts`=?')
            params.push(JSON.stringify(data[prop]))
        } else if (prop==='template') {
            toUpd.push('`template_id`=?')
            params.push(data[prop].id)
            if (!('pages' in data[prop].data)) {
                let tmplData = await template.byId(data[prop].id,conn)
                fs.writeFileSync(`./upload/sites/templateData_${data.id}.json`,JSON.stringify(tmplData[0]))
            } else if ('contentUpdate' in data) {
                fs.writeFileSync(`./upload/sites/templateData_${data.id}.json`,JSON.stringify(data[prop].data))
            }
        } else if (prop==='type') {
            toUpd.push('`type_id`=?')
            params.push(data[prop].value)
        } else if (props.includes(prop)) {
            toUpd.push(`\`${prop}\`=?`)
            params.push(data[prop])
        }
    }
    params.push(data.id)
    return [toUpd,params]
}

module.exports = sites;
