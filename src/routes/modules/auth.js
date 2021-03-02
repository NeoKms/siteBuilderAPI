const express = require('express');
const {validateOneSchema} = require('../../modules/validate')
const router = express.Router();

module.exports = (app, passport, client) => {
    /**
     * @api {post} /auth/login авторизация по логину\паролю
     * @apiDescription Авторизация по логину\паролю
     * @apiName login
     * @apiGroup AUTH
     *
     * @apiSuccessExample {json} Success-Response:
     HTTP/1.1 200 OK
     {
    "message": "ok",
    "result": {
        "name": "root",
        "id": 1,
        "rights": {
            "users": 2,
            "sites": 2
        },
        "phone": "",
        "email": "",
        "fio": "admin"
    }
}
     *
     * @apiErrorExample {json} Error-Response:
     HTTP/1.1 400
     {
         "message":"error",
         "error": text or array
     }
     */
    router.post('/login', validateOneSchema('user-login'), (req, res, next) => {
        passport.authenticate('json', (err, user, info) => {
            if (err === null && user !== false) {
                req.login(user, (error) => {
                    if (error) return next(error);
                    res.json({message: 'ok', result: user});
                });
            } else {
                res.status(401).json({message: 'error', error: err.error || 'not authenticated'});
            }
        })(req, res);
    });

    /**
     * @api {get} /auth/logout Выход из аккаунта
     * @apiDescription Выход из аккаунта
     * @apiName logout
     * @apiGroup AUTH
     *
     * @apiSuccessExample {json} Success-Response:
     HTTP/1.1 200 OK
     {
    "message": "ok",
    "result": "success"
}
     *
     * @apiErrorExample {json} Error-Response:
     HTTP/1.1 400
     {
         "message":"error",
         "error": text or array
     }
     */
    router.get('/logout', (req, res) => {
        req.logout();
        res.json({message: 'ok', result: 'success'});
    });
    /**
     * @api {get} /auth/checkLogin Проверка на авторизацию
     * @apiDescription Проверяет по куки авторизован ли пользователь. При успехе отдает массив данных по юзеру.
     * @apiName checkLogin
     * @apiGroup AUTH
     *
     * @apiSuccessExample {json} Success-Response:
     HTTP/1.1 200 OK
     {
    "auth": {
        "name": "root",
        "id": 1,
        "rights": {
            "users": 2,
            "sites": 2
        },
        "phone": "",
        "email": "",
        "fio": "admin"
    }
}
     *
     * @apiErrorExample {json} Error-Response:
     HTTP/1.1 403
     {
    "message": "error",
    "error": "not authenticated"
}
     */
    router.get('/checkLogin', (req, res, next) => {
        if (req.isAuthenticated()) {
            res.send({message: 'ok', result: req.user});
        } else {
            res.status(403).json({message: 'error', error: "not authenticated"});
        }
    });

    return router;
};
