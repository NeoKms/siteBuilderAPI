const {env} = process;
const fs = require('fs');

const PRODUCTION = String(env.PRODUCTION || false).toLowerCase() == "true"

//only dev//
if (!PRODUCTION) {
    const dotenv = require('dotenv');
    dotenv.config();
}
//

const PORT = env.PORT

const COOKIE_DOMAIN = env.COOKIE_DOMAIN;

const REDIS = {
    HOST: env.REDIS_HOST,
    PORT: env.REDIS_PORT,
    SECRET: 'W*W(7fhsjDK&A*Eh',
    KEY: 'connect.sid',
};

const RABBIT = {
    URL: `amqp://${env.RABBIT_USER}@${env.RABBIT_HOST}`,
    QUERIES: {},
};

const WEBSOCKET_HOST = env.WEBSOCKET_HOST

const DB = {
    DB_HOST: env.DB_HOST,
    DB_PORT: env.DB_PORT,
    DB_USER: env.DB_USER,
    DB_PASSWORD: env.DB_PASSWORD,
    DB_NAME: env.DB_NAME
};

const SENTRY = String(env.SENTRY_KEY || false).toLowerCase() == "true";

const RBAC = require('../modules/rbac')

const SALT = RBAC.authSalt;

const AUTH = {
    LOGIN: env.AUTH_LOGIN,
    PASSWORD: env.AUTH_PASSWORD,
};

const UPLOAD = env.UPLOAD

module.exports = {
    PORT,
    REDIS,
    RABBIT,
    SALT,
    SENTRY,
    COOKIE_DOMAIN,
    DB,
    RBAC,
    PRODUCTION,
    AUTH,
    WEBSOCKET_HOST,
    UPLOAD,
    U_DIRS: {
        'sites'     : checkStaticDir(UPLOAD + 'sites'),
        'templates' : checkStaticDir(UPLOAD + 'templates'),
        'images'    : checkStaticDir(UPLOAD + 'images'),
    }
};

function checkStaticDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, 0744);
    }
    return dir
}
