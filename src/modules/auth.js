const { RBAC } = require('../config');
const { validateSchema } = require('./validate');

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

module.exports = {
    RBAC,
    gen,
};
