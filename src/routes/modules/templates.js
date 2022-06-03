const express = require('express');
const db = require('../../modules/db');
const config = require('../../config');
const fs = require('fs');
const {isAccessRead} = require('../../modules/auth').gen('sites');

const router = express.Router();

module.exports = (app) => {
    /**
     * @api {get} /templates Список шаблонов
     * @apiDescription Отдает список шаблонов со всеми данными
     * @apiName templates
     * @apiGroup TEMPLATES
     * @apiPermission sites: read
     *
     *
     * @apiSuccessExample {json} Success-Response:
     HTTP/1.1 200 OK
     {
{
    "message": "ok",
    "result": [
        {
            "name": "Технопарк стандарт",
            "type_id": 1,
            "active": 1,
            "img": "https://static10.tgstat.ru/channels/_0/e7/e7bf72a2d6081ba3f5a2e0b86606aa6b.jpg",
            "type_name": "Сайт технопарка",
            "id": 1,
            "data": {"style":[...],"pages":[...]}
        }
    ]
}
     *
     * @apiErrorExample {json} Error-Response:
     HTTP/1.1 400
     {
         "message":"error",
         "error":error text or array
     }
     */
    router.get('/', isAccessRead(), async (req, res, next) => {
        try {
            await db.templates.list()
                .then(result => res.json({message: 'ok', result}))
        } catch (error) {
            next(error)
        }
    });

    router.get('/images', isAccessRead(), async (req, res, next) => {
        try {
            let items = fs.readdirSync(config.U_DIRS.images).map(el=>`upload/images/${el}`);
            res.json({message: 'ok', result:items})
        } catch (error) {
            next(error)
        }
    });
    return router;
};
