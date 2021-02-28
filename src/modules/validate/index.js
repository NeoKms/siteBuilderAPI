const Ajv = require('ajv').default;
const ajv = new Ajv({ allErrors: true });
const config = require('../../config');
const logger = require('../../modules/logger');

const userLogin = require('./schemas/users/user-login');

ajv.addSchema(userLogin, 'user-login');

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
        return res.status(400).send(error);
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
        return res.status(400).send(error);
    }
};
const isAuthenticated = () => (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).send('{"err":"not authenticated"}');
    }
};

module.exports = {
    validateSchema,
    validateOneSchema,
    isAuthenticated,
};
