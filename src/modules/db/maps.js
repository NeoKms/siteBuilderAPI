module.exports = {
    liter: {
        map: {
            id: {
                item: "liter.id",
                type: 'number',
                table: false
            },
            name: {
                item: "liter.name",
                type: 'string',
                table: false
            },
            active: {
                item: "liter.active",
                type: 'number',
                table: false
            },
            is_yard: {
                item: "liter.is_yard",
                type: 'number',
                table: false
            },
            object: {
                item: "liter.object",
                type: 'number',
                table: false
            },
            sqr: {
                item: "liter.sqr",
                type: 'string',
                table: false
            },
            stages_count: {
                item: "liter.stages_count",
                type: 'number',
                table: false
            },
            mezzonine: {
                item: "liter.mezzonine",
                type: 'number',
                table: false
            },
            basement: {
                item: "liter.basement",
                type: 'number',
                table: false
            },
            class: {
                item: "liter.class",
                type: 'string',
                table: false
            },
            code: {
                item: "liter.code",
                type: 'string',
                table: false
            },
            conditioning: {
                item: "liter.conditioning",
                type: 'string',
                table: false
            },
            description: {
                item: "liter.description",
                type: 'string',
                table: false
            },
            firefighting: {
                item: "liter.firefighting",
                type: 'string',
                table: false
            },
            firstline: {
                item: "liter.firstline",
                type: 'string',
                table: false
            },
            heating: {
                item: "liter.heating",
                type: 'string',
                table: false
            },
            heightFreightTransport: {
                item: "liter.heightFreightTransport",
                type: 'string',
                table: false
            },
            liftCountCargo: {
                item: "liter.liftCountCargo",
                type: 'string',
                table: false
            },
            liftCountPass: {
                item: "liter.liftCountPass",
                type: 'string',
                table: false
            },
            ventilation: {
                item: "liter.ventilation",
                type: 'string',
                table: false
            },
            videovision: {
                item: "liter.videovision",
                type: 'string',
                table: false
            },
            lifts: {
                item: "liter.lifts",
                type: 'json',
                table: false
            }
        },
        tables: {}
    },
    object: {
        map: {
            id: {
                item: "object.id",
                type: 'number',
                table: false
            },
            name: {
                item: "object.name",
                type: 'string',
                table: false
            },
            nameEn: {
                item: "object.nameEn",
                type: 'string',
                table: false
            },
            active: {
                item: "object.active",
                type: 'number',
                table: false
            },
            type: {
                item: "object.type",
                type: 'number',
                table: false
            },
            contact: {
                item: "object.contact",
                type: 'number',
                table: false
            },
            sqr: {
                item: "object.sqr",
                type: 'string',
                table: false
            },
            house: {
                item: "object.house",
                type: 'number',
                table: false
            },
            address: {
                item: "object.address",
                type: 'json',
                table: false
            },
            accessFromObj: {
                item: "object.accessFromObj",
                type: 'number',
                table: false
            },
            atm: {
                item: "object.atm",
                type: 'number',
                table: false
            },
            cafe: {
                item: "object.cafe",
                type: 'number',
                table: false
            },
            code: {
                item: "object.code",
                type: 'string',
                table: false
            },
            conferenceHall: {
                item: "object.conferenceHall",
                type: 'number',
                table: false
            },
            description: {
                item: "object.description",
                type: 'string',
                table: false
            },
            electrification: {
                item: "object.electrification",
                type: 'number',
                table: false
            },
            farmacy: {
                item: "object.farmacy",
                type: 'number',
                table: false
            },
            internet: {
                item: "object.internet",
                type: 'number',
                table: false
            },
            parking: {
                item: "object.parking",
                type: 'number',
                table: false
            },
            productShop: {
                item: "object.productShop",
                type: 'number',
                table: false
            },
            security24: {
                item: "object.security24",
                type: 'number',
                table: false
            },
            shop: {
                item: "object.shop",
                type: 'number',
                table: false
            },
            supermarket: {
                item: "object.supermarket",
                type: 'number',
                table: false
            },
            videovision: {
                item: "object.videovision",
                type: 'number',
                table: false
            },
            subway: {
                item: "object.subway",
                type: 'json',
                table: false
            },
            img: {
                item: "object.img",
                type: 'string',
                table: false
            },
        },
        tables: {}
    },
    publications: {},
    sites: {},
    templates: {
        map: {
            id: {
                item: "templates.id",
                type: 'number',
                table: false
            },
            name: {
                item: "templates.name",
                type: 'string',
                table: false
            },
            type: {
                item: "templates.type",
                type: 'number',
                table: false
            },
            active: {
                item: "templates.active",
                type: 'number',
                table: false
            },
            img: {
                item: "templates.img",
                type: 'string',
                table: false
            },
            type_name: {
                item: 'template_types.name',
                type: 'string',
                table: 'template_types'
            }
        },
        tables: {
            'template_types': {
                item: 'INNER JOIN `template_types` on `templates`.`type`=`template_types`.`id`',
                link: false
            }
        }
    },
    users: {
        map: {
            id: {
                item: "users.id",
                type: 'number',
                table: false
            },
            name: {
                item: "users.login",
                type: 'string',
                table: false
            },
            password: {
                item: "users.password",
                type: 'string',
                table: false
            },
            fio: {
                item: "users.fio",
                type: 'string',
                table: false
            },
            rights: {
                item: "users.rights",
                type: 'json',
                table: false
            },
            email: {
                item: "users.email",
                type: 'string',
                table: false
            },
            phone: {
                item: "users.phone",
                type: 'string',
                table: false
            },
        },
        tables: {}
    }
};
