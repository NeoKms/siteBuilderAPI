const {env} = process;
const {checkStaticDir} = require('../modules/helpers');
const config = {};
config.PRODUCTION = String(env.PRODUCTION || false).toLowerCase() == "true"

//only dev//
if (!config.PRODUCTION) {
    const dotenv = require('dotenv');
    dotenv.config();
}
//

config.PORT = parseInt(env.PORT) || 3000

config.COOKIE_DOMAIN = env.COOKIE_DOMAIN;

config.REDIS = {
    HOST: env.REDIS_HOST,
    PORT: env.REDIS_PORT,
    SECRET: 'W*W(7fhsjDK&A*Eh',
    KEY: 'connect.sid',
};

config.RABBIT = {
    URL: `amqp://${env.RABBIT_USER}@${env.RABBIT_HOST}`,
    QUERIES: {},
};

config.WEBSOCKET_HOST = env.WEBSOCKET_HOST

config.DB = {
    DB_HOST: env.DB_HOST,
    DB_PORT: env.DB_PORT,
    DB_USER: env.DB_USER,
    DB_PASSWORD: env.DB_PASSWORD,
    DB_NAME: env.DB_NAME
};

config.SENTRY = String(env.SENTRY_KEY || false).toLowerCase() == "true";

config.RBAC = require('../modules/rbac')

config.SALT = config.RBAC.authSalt;

config.AUTH = {
    LOGIN: env.AUTH_LOGIN,
    PASSWORD: env.AUTH_PASSWORD,
};

config.UPLOAD = env.UPLOAD

config.U_DIRS = {
    'sites': checkStaticDir(config.UPLOAD + 'sites'),
    'templates': checkStaticDir(config.UPLOAD + 'templates'),
    'images': checkStaticDir(config.UPLOAD + 'images'),
};

module.exports = config;
