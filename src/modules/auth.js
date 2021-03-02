const { RBAC, PORT, AUTH, REDIS } = require('../config');
const { validateSchema } = require('./validate');
const axios = require('axios');
const cookie = require('cookie');
const logger = require('./logger');

const valid = (req, res, val) => !val || (val && !validateSchema(req, res, val));

const gen = (entity) => ({
    isAccessRead: (val) => async (req, res, next) => {
        if (req.isAuthenticated()) {
            if (RBAC.canRead(req.user, entity)) {
                if (valid(req, res, val)) next();
            } else {
                res.status(403).send('{"err":"not rights"}');
            }
        } else {
            res.status(401).send('{"err":"not authenticated"}');
        }
    },
    isAccessWrite: (val) => async (req, res, next) => {
        if (req.isAuthenticated()) {
            if (RBAC.canWrite(req.user, entity)) {
                if (valid(req, res, val)) next();
            } else {
                res.status(403).send('{"err":"not rights"}');
            }
        } else {
            res.status(401).send('{"err":"not authenticated"}');
        }
    },
    isAccess: (val) => async (req, res, next) => {
        if (req.isAuthenticated()) {
            if (RBAC.isAccess(req.user, entity)) {
                if (valid(req, res, val)) next();
            } else {
                res.status(403).send('{"err":"not rights"}');
            }
        } else {
            res.status(401).send('{"err":"not authenticated"}');
        }
    },
});

const getSessionCookie = (renew = false) => {
    if (global.coockieAuth!==undefined && renew===false) {
        return global.coockieAuth;
    }
    return axios({
        method: 'post',
        url: `http://0.0.0.0:${PORT}/auth/login`,
        data: {
            username: AUTH.LOGIN,
            password: AUTH.PASSWORD,
        },
        withCredentials: true
    }).then( loginCookie => {
        if (loginCookie.headers['set-cookie'] && loginCookie.headers['set-cookie'].length < 1) {
            logger.error(new Error(`login error to 0.0.0.0:${PORT}/auth/login = NO COOKIES!`));
            setTimeout(getSessionCookie(renew),1000);
            return;
        }
        const cookies = cookie.parse(loginCookie.headers['set-cookie'][0]);

        global.coockieAuth = `${REDIS.KEY}=${cookies[REDIS.KEY]}`;

        return global.coockieAuth;
    })
        .catch (error => {
            logger.error(error)
            return false
        })
};

module.exports = {
    RBAC,
    gen,
    getSessionCookie
};
