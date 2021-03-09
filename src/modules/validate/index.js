const Ajv = require('ajv').default;
const ajv = new Ajv({ allErrors: true });
const config = require('../../config');
const logger = require('../../modules/logger');

const userLogin = require('./schemas/users/user-login');
const updateSite = require('./schemas/sites/update-site');
const publfilter = require('./schemas/publications/filter');

ajv.addSchema(userLogin, 'user-login');
ajv.addSchema(updateSite,'update-site');
ajv.addSchema(publfilter,'publ-filter');

function errorResponse(schemaErrors) {
    const errors = schemaErrors.map((error) => ({
        param: error.dataPath,
        requireType: error.params.type,
        message: error.message,
    }));
    logger.error(new Error(JSON.stringify(errors)));
    let msg = config.PRODUCTION ? 'error' : errors
    return {
        message: 'error',
        error: msg,
    };
}

const validateSchema = (req, res, schemaName) => {
    try {
        if (!ajv.validate(schemaName, req.body)) {
            return res.status(400).send(errorResponse(ajv.errors));
        }
    } catch (error) {
        let msg = config.PRODUCTION ? 'error' : error
        return res.status(400).json({
            message: 'error',
            error: msg,
        })
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
        let msg = config.PRODUCTION ? 'error' : error
        return res.status(400).json({
            message: 'error',
            error: msg,
        })
    }
};
const isAuthenticated = () => (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).json({message: 'error', error: "Неавторизовано"});
    }
};

module.exports = {
    validateSchema,
    validateOneSchema,
    isAuthenticated,
};
