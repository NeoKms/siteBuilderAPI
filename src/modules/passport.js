const JsonStrategy = require('passport-json').Strategy;
const { RBAC,SALT } = require('../config');
const crypto = require('crypto');
const db = require('./db')

module.exports = function (passport) {
    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user, done) => {
        done(null, user);
    });

    passport.use('json', new JsonStrategy(
        {
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true,
            allowEmptyPasswords: false,
        },
        ((req, username, password, done) => {
            const hash = crypto.createHash('md5').update(SALT + crypto.createHash('md5').update(password).digest('hex') + crypto.createHash('md5').update(SALT).digest('hex')).digest('hex');
            const dataIn = {
                username,
                password: hash,
            };
            db.user.getAuth(dataIn).then((res) => {
                if (res) {
                    return done(null, {
                        name: res.name,
                        id: res.id,
                        rights: { ...RBAC.defaultRights, ...JSON.parse(res.rights) },
                        phone: res.phone,
                        email: res.email,
                        fio: res.fio,
                    });
                }
                return done({ error: 'Incorrect username or password.' });
            }).catch((err) => done({ error: (err && err.message) || 'Incorrect username or password.' }));
        }),
    ));
};

