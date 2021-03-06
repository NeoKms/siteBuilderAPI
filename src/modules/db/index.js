const user = require('./modules/users');
const sites = require('./modules/sites');
const templates = require('./modules/templates');


const database = {
    user,
    sites,
    templates,
};

module.exports = database;
