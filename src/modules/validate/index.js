const Ajv = require("ajv").default;
const ajv = new Ajv({ allErrors: true });
const config = require("../../config");
const logger = require("../../modules/logger");
const fs = require("fs");

readSchemas(`${__dirname}/schemas`);


function errorResponse(schemaErrors) {
  const errors = schemaErrors.map((error) => ({
    param: error.dataPath,
    requireType: error.params.type,
    message: error.message,
  }));
  logger.error(new Error(JSON.stringify(errors)));
  let msg = config.PRODUCTION ? "error" : errors;
  return {
    message: "error",
    error: msg,
  };
}
function readSchemas(dir) {
  fs.readdirSync(dir).map(module => {
    if (module.indexOf(".json")!==-1) {
      ajv.addSchema(require(`${dir}/${module}`), module.replace(".json", ""));
    } else {
      readSchemas(`${dir}/${module}`);
    }
  });
}
const validateSchema = (req, res, schemaName) => {
  try {
    if (!ajv.validate(schemaName, req.body)) {
      return res.status(400).send(errorResponse(ajv.errors));
    }
  } catch (error) {
    let msg = config.PRODUCTION ? "error" : error;
    return res.status(400).json({
      message: "error",
      error: msg,
    });
  }
};
const validateOneSchema = (schemaName) => (req, res, next) => {
  try {
    if (!ajv.validate(schemaName, req.body)) {
      return res.status(400).send(errorResponse(ajv.errors));
    } else {
      next();
    }
  } catch (error) {
    let msg = config.PRODUCTION ? "error" : error;
    return res.status(400).json({
      message: "error",
      error: msg,
    });
  }
};
const isAuthenticated = () => (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).json({message: "error", error: "Неавторизовано"});
  }
};

module.exports = {
  validateSchema,
  validateOneSchema,
  isAuthenticated,
};
