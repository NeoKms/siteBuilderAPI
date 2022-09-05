const express = require('express');
const db = require('../../modules/db');
const {isAccessRead, isAccessWrite, isAccess} = require('../../modules/auth').gen('sites');
const rabbitQueues = require('../../modules/rabbitQueues')
const router = express.Router();

module.exports = (app) => {
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
            next(error)
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
    "result":
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
            next(error)
        }
    });
    /**
     * @api {get} /sites/:id/build Данные по сайту для билдера
     * @apiDescription Отдает полный перечень данных по выбранному сайту и массик файлов для выгрузки
     * @apiName sitesById_build
     * @apiGroup SITES
     * @apiPermission sites: read
     *
     *
     * @apiSuccessExample {json} Success-Response:
     HTTP/1.1 200 OK
     {
    "message": "ok",
    "result":
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
            },
            "template": {
            ...
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
    router.get('/:id/build', isAccessRead(), async (req, res, next) => {
        const {id} = req.params
        try {
            await db.sites.getSite(id, true)
                .then(result => {
                    if (!result) {
                        res.status(404)
                    }
                    res.json({message: 'ok', result})
                })
        } catch (error) {
            next(error)
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
                .then( result => {
                    if (result.active) {
                        rabbitQueues.toDataProcessor({
                            site_id: result.id,
                            template_id: result.template.id,
                            type: 'update',
                            domain: result.address,
                        })
                    }
                    res.json({message: 'ok', result})
                })

        } catch (error) {
            next(error)
        }
    });
    /**
     * @api {delete} /sites/:id Удаление сайта
     * @apiDescription Удаление сайта из системы
     * @apiName sitesDelById
     * @apiGroup SITES
     * @apiPermission sites: read
     *
     * @apiSuccessExample {json} Success-Response:
     HTTP/1.1 200 OK
     {
    "message": "ok",
}
     *
     * @apiErrorExample {json} Error-Response:
     HTTP/1.1 400
     {
         "message":"error",
         "error":error text or array
     }
     */
    router.delete('/:id', isAccessWrite(), async (req, res, next) => {
        const {id} = req.params
        try {
            await db.sites.delSite(id)
                .then( noRes => res.json({message: 'ok'}))
        } catch (error) {
            next(error)
        }
    });
    /**
     * @api {put} /sites/ Создание сайта
     * @apiDescription Создать сайт.
     * @apiName sitesAddNew
     * @apiGroup SITES
     * @apiPermission sites: write
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
    router.put('/', isAccessWrite('add-new-site'), async (req, res, next) => {
        const { name } = req.body
        try {
            await db.sites.newSite(name)
                .then( id => db.sites.getSite(id))
                .then( result => res.json({message: 'ok', result}))
        } catch (error) {
            next(error)
        }
    });
    /**
     * @api {put} /sites/:id/publish Опубликовать сайт
     * @apiDescription Добавляет в очередь кролика на публикацию сообщение с этим сайтом.
     * @apiName sitesPublish
     * @apiGroup SITES
     * @apiPermission sites: write
     *
     * @apiSuccessExample {json} Success-Response:
     HTTP/1.1 200 OK
     {
        "message": "ok"
     }
     *
     * @apiErrorExample {json} Error-Response:
     HTTP/1.1 400
     {
         "message":"error",
         "error":error text or array
     }
     */
    router.put('/:id/publish', isAccessWrite(), async (req, res, next) => {
        const {id} = req.params
        try {
            await db.sites.getSite(id)
                .then(siteData => {
                    if (!siteData) {
                        res.status(404).end()
                        return;
                    }
                    let errors = checkSiteDataToDeploy(siteData)
                    if (errors.length) {
                        res.json({message: 'error', error: errors})
                    } else if (siteData.processing) {
                        res.json({message: 'ok'})
                    } else {
                        db.sites.setProcessing(siteData.id, 1)
                            .then( noRes => {
                                rabbitQueues.toDataProcessor({
                                    site_id: siteData.id,
                                    template_id: siteData.template.id,
                                    type: 'deploy',
                                    domain: siteData.address,
                                })
                                res.json({message: 'ok'})
                            })
                    }
                })
        } catch (error) {
            next(error)
        }
    });
    /**
     * @api {put} /sites/:id/unpublish Снять сайт с публикации
     * @apiDescription Отправляет сообщение в очередь кролика с удалением сайта.
     * @apiName sitesPublish
     * @apiGroup SITES
     * @apiPermission sites: write
     *
     * @apiSuccessExample {json} Success-Response:
     HTTP/1.1 200 OK
     {
        "message": "ok"
     }
     *
     * @apiErrorExample {json} Error-Response:
     HTTP/1.1 400
     {
         "message":"error",
         "error":error text or array
     }
     */
    router.put('/:id/unpublish', isAccessWrite(), async (req, res, next) => {
        const {id} = req.params
        try {
            await db.sites.getSite(id)
                .then(siteData => {
                    if (!siteData) {
                        res.status(404).end()
                        return;
                    }
                    if (!siteData.active) {
                        throw new Error('Сайт не опубликован')
                    }
                    db.sites.setProcessing(siteData.id, 2)
                            .then( noRes => {
                                rabbitQueues.toDataProcessor({
                                    site_id: siteData.id,
                                    type: 'delete',
                                })
                                res.json({message: 'ok'})
                            })
                })
        } catch (error) {
            next(error)
        }
    });
    return router;
};
function checkSiteDataToDeploy(siteData) {
    let errors = []
    const c = siteData.contacts
    const contactsChecked = !!c.city && !!c.coordinate.x && !!c.coordinate.y && !!c.emailFeedback && !!c.emailMain && !!c.index && !!c.litera && !!c.street && !!c.city && !!c.doubleMailing && !!c.house && !!c.phone && !!c.title
    if (!contactsChecked) {
        errors.push("Не заполнены контактные данные")
    }
    if (!siteData.address) {
        errors.push("Не выбран адрес (домен)")
    }
    if (siteData.type.value<1) {
        errors.push("Не выбран тип")
    }
    if (siteData.template.id<1) {
        errors.push("Не выбран шаблон")
    }
    if (!siteData.publications.length) {
        errors.push("Не выбраны публикации")
    }
    return errors
}
