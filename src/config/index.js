const {env} = process;

//only dev//
if (!env.PRODUCTION) {
    const dotenv = require('dotenv');
    dotenv.config();
}
//
const PRODUCTION = env.PRODUCTION || false

const PORT = env.PORT || 3001;

const COOKIE_DOMAIN = env.COOKIE_DOMAIN || 'dev.lan';

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

const DB = {
    DB_HOST:  env.DB_HOST,
    DB_PORT: env.DB_PORT,
    DB_USER: env.DB_USER,
    DB_PASSWORD: env.DB_PASSWORD,
    DB_NAME: env.DB_NAME
};

const SENTRY = env.SENTRY_KEY;

const RBAC = require('../modules/rbac')

const SALT = RBAC.authSalt;

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
};
