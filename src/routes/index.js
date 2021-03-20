const express = require('express');

const router = express.Router();

console.log();
module.exports = (app, passport, client) => {
    require('fs').readdirSync('./src/routes/modules').map( (module)=> {
        app.use(`/${module.replace('.js', '')}`, require(`./modules/${module}`)(app, passport, client));
    });
    app.use('/upload/sites/', express.static('./upload/sites/'));
    app.use('/upload/templates/', express.static('./upload/templates/'));
    app.use(router);

    router.get('/', (req, res, next) => {
        res.json({server: 'api is working'});
    });

    router.get('/date', (req, res) => {
        res.json({date: new Date()});
    });
}
