const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const config = require('./src/config');
const bodyParser = require('body-parser');
const logger = require('./src/modules/logger');
const redis = require('redis');
const RedisStore = require('connect-redis')(session);
const passport = require('passport');

const app = express();

//redis
const client = redis.createClient({
    host: config.REDIS.HOST,
    port: config.REDIS.PORT,
});
//
//sentry
const Sentry = require("@sentry/node");
const Tracing =  require("@sentry/tracing");
if (config.SENTRY!==false) {
    Sentry.init({
        dsn: config.SENTRY,
        integrations: [
            new Sentry.Integrations.Http({tracing: true}),
            new Tracing.Integrations.Express({app}),
        ],
        tracesSampleRate: 1.0,
    });
    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());
    app.use(Sentry.Handlers.errorHandler());
}
//
//session
app.use(session({
    secret: config.REDIS.SECRET,
    resave: true,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 30,
        httpOnly: false,
        sameSite: 'lax',
        domain: config.COOKIE_DOMAIN,
    },
    store: new RedisStore({ host: config.REDIS.HOST, port: config.REDIS.PORT, client }),
}));
//
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,OPTIONS,DELETE');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Access-Control-Allow-Methods, Authorization, X-Requested-With, Access-Control-Allow-Origin, Set-Cookie');
    next();
});
app
    .use(bodyParser.urlencoded())
    .use(bodyParser.json())
    .use(cookieParser());

app
    .use(passport.initialize())
    .use(passport.session());

process.dbPool = require('./src/modules/db/connect');

require('./src/modules/passport')(passport);
require('./src/routes')(app, passport, client);

if (require('fs').existsSync('./doc/index.html')) {
    app.use(express.static('./doc'));
    app.use('/apidoc', express.static(__dirname + '/doc'));
}

app.listen(config.PORT, '0.0.0.0', () => {
    logger.info(`server runing port: ${config.PORT}`);
});
