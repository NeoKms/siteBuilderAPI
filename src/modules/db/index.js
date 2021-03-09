module.exports = require('fs').readdirSync('./src/modules/db/modules').reduce( (db,module)=>{db[module.replace('.js','')]= require(`./modules/${module}`);return db;},{});
