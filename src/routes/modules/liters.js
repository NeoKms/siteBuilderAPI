const express = require('express');
const logger = require('../../modules/logger');
const db = require('../../modules/db');
const config = require('../../config');
const {isAccessRead, isAccessWrite, isAccess} = require('../../modules/auth').gen('sites');

const router = express.Router();

module.exports = (app) => {
    router.get('/', isAccessRead(), async (req, res, next) => {
        try {
            await db.liters.list()
                .then(result => res.json({message: 'ok', result}))
        } catch (error) {
            next(error)
        }
    });
    router.post('/byIds', isAccessRead('ids'), async (req, res, next) => {
        const items = req.body
        try {
            await db.liters.byIds(items.ids)
                .then(result => res.json({message: 'ok', result}))
        } catch (error) {
            next(error)
        }
    });
    return router;
};
