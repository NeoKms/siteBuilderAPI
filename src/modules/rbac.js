const crypto = require('crypto');
const rights = {
    deny: 0,
    read: 1,
    write: 2,
};
const rightsValues = Object.values(rights);
const entities = {
    'users': 'Пользователи',
    'sites': 'Сайты',
};
const authSalt = 'mamamilaramy';
const defaultRights = {
    users: 0,
    sites: 0
}

const checkRights = (user = {}, e, r) => user.rights && user.rights[e] >= r;
const canRead = (user = {}, entity) => checkRights(user, entity, rights.read);
const canWrite = (user = {}, entity) => checkRights(user, entity, rights.write);
const isDeny = (user = {}, e) => user.rights && user.rights[e] === rights.deny;
const isAccess = (user = {}, e) => user.rights && user.rights[e] > rights.deny;
const checkValidRight = (e, r) => entities.hasOwnProperty(e) && (r === null || rightsValues.includes(r));
const md5 = (x) => crypto.createHash('md5').update(x).digest('hex');
const hashPassword = (password) => md5(authSalt + md5(password) + md5(authSalt));

module.exports = {
    checkRights,
    canRead,
    canWrite,
    isDeny,
    isAccess,
    checkValidRight,
    hashPassword,
    rights,
    entities,
    authSalt,
    rightsValues,
    defaultRights
};
