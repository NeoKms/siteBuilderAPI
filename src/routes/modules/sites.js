const express = require('express');
const logger = require('../../modules/logger');
const db = require('../../modules/db');
const config = require('../../config')
const {isAccessRead, isAccessWrite, isAccess} = require('../../modules/auth').gen('sites');

const router = express.Router();

module.exports = (app, passport, client) => {
    /**
     * @api {get} /sites Список сайтов
     * @apiDescription Отдает список сайтов с минимальным кол-вом пропов
     * @apiName sites
     * @apiGroup SITES
     * @apiPermission sites: read
     *
     *
     * @apiSuccessExample {json} Success-Response:
     HTTP/1.1 200 OK
     {
    "message": "ok",
    "result": [
        {
            "id": 1,
            "type_id": 1,
            "name": "site1",
            "active": 1,
            "address": "vlad.dev.lan",
            "img": "https://www.vkpress.ru/upload/iblock/56b/56b5d2504d707f50989bc1677e0fce38.png",
            "type": {
                "options": [
                    {
                        "value": 1,
                        "label": "Сайт",
                        "code": "site"
                    },
                    {
                        "value": 2,
                        "label": "Лендинг",
                        "code": "landing"
                    },
                    {
                        "value": 3,
                        "label": "Промо-сайт",
                        "code": "promoSite"
                    }
                ],
                "value": 1
            }
        },
        {
            "id": 2,
            "type_id": 2,
            "name": "site2",
            "active": 0,
            "address": "vlad2.dev.lan",
            "img": "https://99px.ru/sstorage/56/2019/07/image_562207191850033055418.jpg",
            "type": {
                "options": [
                    {
                        "value": 1,
                        "label": "Сайт",
                        "code": "site"
                    },
                    {
                        "value": 2,
                        "label": "Лендинг",
                        "code": "landing"
                    },
                    {
                        "value": 3,
                        "label": "Промо-сайт",
                        "code": "promoSite"
                    }
                ],
                "value": 2
            }
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
            await db.sites.siteList()
                .then(result => res.json({message: 'ok', result}))
        } catch (error) {
            logger.error(error)
            let msg = config.PRODUCTION ? 'error' : error.message
            res.status(400).json({message: 'error', error: msg});
        }
    });
    /**
     * @api {get} /sites/:id Данные по сайту
     * @apiDescription Отдает полный перечень данных по выбранному сайту
     * @apiName sitesById
     * @apiGroup SITES
     * @apiPermission sites: read
     *
     *
     * @apiSuccessExample {json} Success-Response:
     HTTP/1.1 200 OK
     {
    "message": "ok",
    "result": [
        {
            "id": 1,
            "type_id": 1,
            "name": "site1",
            "active": 1,
            "address": "vlad.dev.lan",
            "img": "https://www.vkpress.ru/upload/iblock/56b/56b5d2504d707f50989bc1677e0fce38.png",
            "type": {
                "options": [
                    {
                        "value": 1,
                        "label": "Сайт",
                        "code": "site"
                    },
                    {
                        "value": 2,
                        "label": "Лендинг",
                        "code": "landing"
                    },
                    {
                        "value": 3,
                        "label": "Промо-сайт",
                        "code": "promoSite"
                    }
                ],
                "value": 1
            }
        },
        {
            "id": 2,
            "type_id": 2,
            "name": "site2",
            "active": 0,
            "address": "vlad2.dev.lan",
            "img": "https://99px.ru/sstorage/56/2019/07/image_562207191850033055418.jpg",
            "type": {
                "options": [
                    {
                        "value": 1,
                        "label": "Сайт",
                        "code": "site"
                    },
                    {
                        "value": 2,
                        "label": "Лендинг",
                        "code": "landing"
                    },
                    {
                        "value": 3,
                        "label": "Промо-сайт",
                        "code": "promoSite"
                    }
                ],
                "value": 2
            }
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
    router.get('/:id', isAccessRead(), async (req, res, next) => {
        const {id} = req.params
        try {
            await db.sites.getSite(id)
                .then(result => {
                    if (!result) {
                        res.status(404)
                    }
                    res.json({message: 'ok', result})
                })
        } catch (error) {
            logger.error(error)
            let msg = config.PRODUCTION ? 'error' : error.message
            res.status(400).json({message: 'error', error: msg});
        }
    });
    /**
     * @api {post} /sites/:id Сохранение сайта
     * @apiDescription Сохранить сайт. При установки нового шаблона файл шаблона перетирается.
     * При сохранении уже выбранного шаблона необходимо дополнительно передавать признак сохранения контента.
     * В случае успеха возвращает полный перечень данных по сайту.
     * @apiName sitesById
     * @apiGroup SITES
     * @apiPermission sites: read
     *
     *
     * @apiParamExample {json} Request-Example:
     {
"active": 1
"address": "vlad.dev.lan"
"contacts": {"title:" "названиеорг", "phone": "телорг", "city": "город", "street": "улиц", "house": "1", "litera": "2", ...}
"contentUpdate": true
"description": "тест сайт 1"
"id": 1
"img": "https://www.vkpress.ru/upload/iblock/56b/56b5d2504d707f50989bc1677e0fce38.png"
"name": "site1",
"type": {
"options":[...],
"value":1
}
}
     *

     * @apiSuccessExample {json} Success-Response:
     HTTP/1.1 200 OK
     {
    "message": "ok",
    "result": {
"active": 1
"address": "vlad.dev.lan"
"contacts": {"title:" "названиеорг", "phone": "телорг", "city": "город", "street": "улиц", "house": "1", "litera": "2", ...}
"contentUpdate": true
"description": "тест сайт 1"
"id": 1
"img": "https://www.vkpress.ru/upload/iblock/56b/56b5d2504d707f50989bc1677e0fce38.png"
"name": "site1",
"type": {
"options":[...],
"value":1
}
    }
}
     *
     * @apiErrorExample {json} Error-Response:
     HTTP/1.1 400
     {
         "message":"error",
         "error":error text or array
     }
     */
    router.post('/:id', isAccessWrite('update-site'), async (req, res, next) => {
        const {id} = req.params
        const data = req.body
        try {
            await db.sites.setSite(data,id)
                .then( noRes => db.sites.getSite(id))
                .then( result => res.json({message: 'ok', result}))
        } catch (error) {
            logger.error(error)
            let msg = config.PRODUCTION ? 'error' : error.message
            res.status(400).json({message: 'error', error: msg});
        }
    });
    router.delete('/:id', isAccessWrite(), async (req, res, next) => {
        const {id} = req.params
        try {
            await db.sites.delSite(id)
                .then( noRes => res.json({message: 'ok'}))
        } catch (error) {
            logger.error(error)
            let msg = config.PRODUCTION ? 'error' : error.message
            res.status(400).json({message: 'error', error: msg});
        }
    });
    router.post('/', isAccessWrite('add-new-site'), async (req, res, next) => {
        const { name } = req.body
        try {
            await db.sites.newSite(name)
                .then( id => db.sites.getSite(id))
                .then( result => res.json({message: 'ok', result}))
        } catch (error) {
            logger.error(error)
            let msg = config.PRODUCTION ? 'error' : error.message
            res.status(400).json({message: 'error', error: msg});
        }
    });
    return router;
};
