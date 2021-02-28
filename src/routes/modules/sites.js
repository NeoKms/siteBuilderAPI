const express = require('express');
const logger = require('../../modules/logger');
const db = require('../../modules/db');
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
         "message":"text error"
     }
     */
    router.get('/', isAccessRead(), async (req, res, next) => {
        try {
            db.sites.siteList()
                .then(result => res.json({message: 'ok', result}))
        } catch (error) {
            logger.error(error)
            let msg = config.PRODUCTION ? 'error' : error.message
            res.json({message: msg}).status(400);
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
         "message":"text error"
     }
     */
    router.get('/:id', isAccessRead(), async (req, res, next) => {
        const {id} = req.params
        try {
            db.sites.getSite(id)
                .then(result => res.json({message: 'ok', result}))
        } catch (error) {
            logger.error(error)
            let msg = config.PRODUCTION ? 'error' : error.message
            res.json({message: msg}).status(400);
        }
    });
    return router;
};
