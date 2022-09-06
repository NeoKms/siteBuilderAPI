const express = require("express");
const config = require("../config");
const router = express.Router();

module.exports = (app) => {
  let dir = `${__dirname}/modules`;
  require("fs").readdirSync(dir).map(module => {
    if (module==="index.js") return;
    if (module.indexOf(".js")!==-1) {
      router.use(`/${module.replace(".js", "")}`, require(`${dir}/${module}`)(app));
    } else {
      router.use(`/${module}`, require(`${dir}/${module}`)(app));
    }
  });

  app.use("/upload/sites/", express.static(config.U_DIRS.sites));
  app.use("/upload/templates/", express.static(config.U_DIRS.templates));
  app.use("/upload/images/", express.static(config.U_DIRS.images));
  app.use(router);

  router.get("/", (req, res) => {
    res.json({server: "api is working",date: new Date()});
  });
};
