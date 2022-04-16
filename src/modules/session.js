const session = require('express-session');
const redis = require('redis');
const RedisStore = require('connect-redis')(session);
const passport = require('passport');
const config = require("../config");
const client = redis.createClient({
    host: config.REDIS.HOST,
    port: config.REDIS.PORT,
});

module.exports = (app) => {
    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,OPTIONS,DELETE');
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Access-Control-Allow-Methods, Authorization, X-Requested-With, Access-Control-Allow-Origin, Set-Cookie');
        next();
    })
        .use(session({
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
            store: new RedisStore({host: config.REDIS.HOST, port: config.REDIS.PORT, client}),
        }))
        .use(passport.initialize())
        .use(passport.session());
    require('./passport')(passport);
}

