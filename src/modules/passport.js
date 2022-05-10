const JsonStrategy = require('passport-json').Strategy;
const { RBAC } = require('../config');
const {createHashPassword} = require('./helpers');
const db = require('./db');

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
            const dataIn = {
                username,
                password: createHashPassword(password),
            };
            db.users.getAuth(dataIn).then((res) => {
                if (res) {
                    return done(null, {
                        name: res.name,
                        id: res.id,
                        rights: { ...RBAC.defaultRights, ...res.rights },
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

