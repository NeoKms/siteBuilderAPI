const express = require('express');
const db = require('../../modules/db');
const {isAccessRead} = require('../../modules/auth').gen('sites');

const router = express.Router();

module.exports = (app) => {
    router.get('/', isAccessRead(), async (req, res, next) => {
        try {
            await db.publications.list()
                .then(result => res.json({message: 'ok', result}))
        } catch (error) {
            next(error)
        }
    });
    router.post('/byFilter', isAccessRead('publ-filter'), async (req, res, next) => {
        try {
            await db.publications.byfilter(req.body)
                .then(result => res.json({message: 'ok', result}))
        } catch (error) {
            next(error)
        }
    });
    return router;
};
