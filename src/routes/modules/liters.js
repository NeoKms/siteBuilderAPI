const express = require('express');
const logger = require('../../modules/logger');
const db = require('../../modules/db');
const config = require('../../config');
const {isAccessRead, isAccessWrite, isAccess} = require('../../modules/auth').gen('sites');

const router = express.Router();

module.exports = (app, passport, client) => {
    router.get('/', isAccessRead(), async (req, res, next) => {
        try {
            await db.liters.list()
                .then(result => res.json({message: 'ok', result}))
        } catch (error) {
            logger.error(error)
            let msg = config.PRODUCTION ? 'error' : error.message
            res.status(400).json({message: 'error', error: msg});
        }
    });
    return router;
};
