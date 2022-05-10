const crypto = require('crypto');
let cacheObj = {};
let expires = {};
module.exports = {
    createHash: (string) => crypto.createHash('md5').update(string).digest('hex'),
    get: (key) => {
        if (cacheObj.hasOwnProperty(key) && cacheObj[key]) {
            return cacheObj[key].data
        } else {
            return false
        }
    },
    /* 10min default */
    set: (key, data, expire= 600000 ) => {
        cacheObj[key] = {
            data,
            expire,
        }
        if (expires.hasOwnProperty(key) && expires[key]) {
            try {
                clearTimeout(expires[key])
            } catch (err) {}
        }
        expires[key] = setTimeout(()=>{
            delete cacheObj[key];
        }, expire)
    }
}
