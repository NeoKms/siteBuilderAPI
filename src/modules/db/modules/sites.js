const logger = require('../../../modules/logger');
const db = require('../connect')
const fs = require('fs')
const template = require('./templates')
const publ = require('./publications')
const sites = {};

sites.siteList = async () => {
    let connection;
    let res;
    try {
        connection = await db.connection();
        res = await connection.query("SELECT `id`,`type_id`,`name`,`active`,`img`,`address`,`processing` FROM `sites` ");
        res = await reabaseSite(res, connection)
    } catch (err) {
        logger.error(err, 'sites.siteList:');
        throw err;
    } finally {
        if (connection) await connection.release();
    }
    return res
};
sites.getSite = async (id, build = false) => {
    let connection;
    let res;
    try {
        connection = await db.connection();
        res = await connection.query("SELECT * FROM `sites` where `id`=?", [id]);
        res = await reabaseSite(res, connection, true, build)
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
        connection = await db.connection();
        data = await prepareToSave(data, connection)
        res = await connection.query("update `sites` set " + data[0].join(',') + " where `id`=?", data[1]);
    } catch (err) {
        logger.error(err, 'sites.getSite:');
        throw err;
    } finally {
        if (connection) await connection.release();
    }
    return res
};
sites.newSite = async (name) => {
    let connection;
    let res;
    try {
        connection = await db.connection();
        await connection.query("insert into `sites` (`name`) values (?)", [name]);
        res = await connection.query("SELECT LAST_INSERT_ID() as `id`");
        res = res[0].id
    } catch (err) {
        logger.error(err, 'sites.getSite:');
        throw err;
    } finally {
        if (connection) await connection.release();
    }
    return res
};
sites.delSite = async (id) => {
    let connection;
    let res;
    try {
        connection = await db.connection();
        await connection.query("delete from `sites` where `id`=?", [id]);
    } catch (err) {
        logger.error(err, 'sites.getSite:');
        throw err;
    } finally {
        if (connection) await connection.release();
    }
    return res
};
sites.setProcessing = async (id, val) => {
    let connection;
    let res;
    try {
        connection = await db.connection();
        await connection.query("update `sites` set `processing`=? where `id`=?", [val,id]);
    } catch (err) {
        logger.error(err, 'sites.setProcessing:');
        throw err;
    } finally {
        if (connection) await connection.release();
    }
    return res
};
sites.changeActive = async (id, val) => {
    let connection;
    let res;
    try {
        connection = await db.connection();
        await connection.query("update `sites` set `active`=?, `processing`=0 where `id`=?", [val,id]);
    } catch (err) {
        logger.error(err, 'sites.changeActive:');
        throw err;
    } finally {
        if (connection) await connection.release();
    }
    return res
};
async function reabaseSite(res, connection, oneSite = false, build = false) {
    if (res && res.length) {
        let types = await connection.query("select `id` as `value`,`name` as `label`,`code` from `site_types`")
        for (let i = 0; i < res.length; i++) {
            let el = res[i]
            if ('img' in el) {
                el.img = el.img || ''
            }
            if ('address' in el) {
                el.address = el.address || ''
            }
            if ('contacts' in el) {
                el.contacts = JSON.parse(el.contacts) || {
                    "title": "",
                    "phone": "",
                    "city": "",
                    "street": "",
                    "house": "",
                    "litera": "",
                    "index": 0,
                    "emailMain": "",
                    "emailFeedback": "",
                    "doubleMailing": 0,
                    "coordinate": {"x": "", "y": ""}
                }
            }
            if (oneSite && 'template_id' in el) {
                el.publications = await connection.query("select `publ_id` as `id` from `site_publications` where `site_id`=?", [el.id])
                if (build) {
                    const files = await getFiles(`upload/templates/${el.template_id}/`);
                    el.download = [
                        {
                            name: `site.settings.json`,
                            path: `upload/sites/templateData_${el.id}.json`
                        },
                        {
                            name: 'template.json',
                            path: `upload/templates/${el.template_id}/template.json`
                        },
                        ...files
                    ]
                }
            }
            if ('template_id' in el) {
                let templateData = {}
                let templateDataPath = `./upload/sites/templateData_${el.id}.json`
                if (el.template_id > 0 && fs.existsSync(templateDataPath)) {
                    templateData = JSON.parse(fs.readFileSync(templateDataPath, 'utf8')) || {}
                }
                el.template = templateData
                delete el.template_id
            }
            if ('type_id' in el) {
                el.type = {
                    options: types,
                    value: el.type_id || -1
                }
                delete el.type_id
            }
            res[i] = el
        }
        return res
    } else {
        return res
    }
}
async function getFiles(path = "./") {
    const { promises: fs } = require("fs");
    const entries = await fs.readdir(path, { withFileTypes: true });
    const files = entries
        .filter(file => !file.isDirectory())
        .map(file => ({ ...file, path: path + file.name }));
    const folders = entries.filter(folder => folder.isDirectory());

    for (const folder of folders)
        files.push(...await getFiles(`${path}${folder.name}/`));
    return files;
}
async function prepareToSave(data, conn) {
    let props = [
        'active', 'address', 'description', 'name',
    ]
    let toUpd = []
    let params = []
    for (let prop in data) {
        if (prop === 'contacts') {
            toUpd.push('`contacts`=?')
            params.push(JSON.stringify(data[prop]))
        } else if (prop === 'template' && data[prop].id > 0) {
            toUpd.push('`template_id`=?')
            params.push(data[prop].id)
            let siteProps = {
                name: data.name || '',
                address: 'THIS IS ADDRESS',
                contacts: data.contacts || {
                    "title": "",
                    "phone": "",
                    "city": "",
                    "street": "",
                    "house": "",
                    "litera": "",
                    "index": 0,
                    "emailMain": "",
                    "emailFeedback": "",
                    "doubleMailing": 0,
                    "coordinate": {"x": "", "y": ""}
                },
                api_keys: {yandex_metrica: '',google_metrica: '',verbox: '',recaptcha_public: '',},
            }
            if (!('pages' in data[prop])) {
                let tmplData = await template.byId(data[prop].id, conn)
                let settings = tmplData[0]
                settings.siteProps = siteProps;
                fs.writeFileSync(`./upload/sites/templateData_${data.id}.json`, JSON.stringify(settings))
            } else {
                data[prop].siteProps = siteProps;
                data[prop] = reinitImgInObj(data[prop])
                fs.writeFileSync(`./upload/sites/templateData_${data.id}.json`, JSON.stringify(data[prop]))
            }
        } else if (prop === 'type') {
            toUpd.push('`type_id`=?')
            params.push(data[prop].value)
        } else if (prop === 'publications') {
            await publ.setOnSite(data[prop].map(el => el.id), data.id, conn)
        } else if (props.includes(prop)) {
            toUpd.push(`\`${prop}\`=?`)
            params.push(data[prop])
        }
    }
    params.push(data.id)
    return [toUpd, params]
}
function reinitImg(url) {
    if (url.indexOf('http')!==-1) {
        let splitted = url.split('/upload/')
        if (splitted[1]) {
            url = 'upload/'+url.split('/upload/')[1]
        }
    }
    return url
}
function reinitImgInObj(obj) {
    for (let key in obj) {
        if (typeof obj[key] === 'object') {
            obj[key] = reinitImgInObj(obj[key])
        } else if (key === 'img' && obj[key]) {
            obj[key] = reinitImg(obj[key])
        }
    }
    return obj
}
module.exports = sites;
