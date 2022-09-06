let toAddDb = [];
const modulesObj = require("fs").readdirSync("./src/modules/db/modules").reduce((db, module) => {
  let moduleName = module.replace(".js", "");
  db[moduleName] = require(`./modules/${module}`);
  if (typeof db[moduleName]==="function") {
    db[moduleName] = new db[moduleName]();
    toAddDb.push(moduleName);
  }
  return db;
}, {});
toAddDb.map(el=>modulesObj[el].setExternalDB(modulesObj));
module.exports = modulesObj;
