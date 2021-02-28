const express = require('express');

const router = express.Router();

const auth = require('./modules/auth');
const sites = require('./modules/sites');

module.exports = (app, passport, client) => {

    app.use('/auth', auth(app, passport, client));
    app.use('/sites', sites(app, passport, client));

    app.use(router);

    router.get('/', (req, res, next) => {
        res.json({server: 'api is working'});
    });

    router.get('/date', (req, res) => {
        res.json({date: new Date()});
    });
}
