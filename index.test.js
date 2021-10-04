process.env.IS_TEST = true
const app = require('./app')
const request = require('supertest')
const config = require('./src/config')
const cookie = require('cookie')
const chai = require("chai")
const chaiAsPromised = require("chai-as-promised")
chai.use(chaiAsPromised)
const expect = chai.expect
const assert = chai.assert
let authCookie = 'authCookie'
describe("Тест доступности", () => {
    it("/ [GET]", async () => {
        return request(app)
            .get('/')
            .expect(200)
    })
})
describe("Тест авторизации", () => {
    it("Прохождение авторизации",async() => {
        return request(app)
            .post('/auth/login')
            .set('cookie',authCookie)
            .send({
                "username": config.AUTH.LOGIN,
                "password": config.AUTH.PASSWORD,
            })
            .expect(200)
            .then(response => {
                const authData = response.data

                expect(authData, 'Ответ апи должен быть успешным').to.have.property('message').equal('ok')
                expect(response.headers, 'Куки должен существовать').to.have.property('set-cookie').that.lengthOf(1)

                const cookies = cookie.parse(response.headers['set-cookie'][0])

                expect(cookies, 'Куки должен иметь ключ редиса').to.have.property(config.REDIS.KEY)

                authCookie.headers.cookie = `${config.REDIS.KEY}=${cookies[config.REDIS.KEY]}`
            })
    })

    it("Прохождение аутентификации",async () => {
        return request(app)
            .get('/auth/checkLogin')
            .set('cookie',authCookie)
            .expect(200)
    })

    it("Логаут",async () => {
        return request(app)
            .get('/auth/logout')
            .set('cookie',authCookie)
            .expect(200)
            .then(()=>request(app))
            .get('/auth/checkLogin')
            .set('cookie',authCookie)
            .expect(403,'Проверка аутентификации после логаута должна отдать код 403')
    })
})

describe("Тест шаблонов", () => {

    it("Прохождение авторизации",async () => {
        return request(app)
            .get('/auth/login')
            .set('cookie',authCookie)
            .send({
                "username": config.AUTH.LOGIN,
                "password": config.AUTH.PASSWORD,
            })
            .expect(200)
            .then(response => {
                const authData = response.data

                expect(authData, 'Ответ апи должен быть успешным').to.have.property('message').equal('ok')
                expect(response.headers, 'Куки должен существовать').to.have.property('set-cookie').that.lengthOf(1)

                const cookies = cookie.parse(response.headers['set-cookie'][0])

                expect(cookies, 'Куки должен иметь ключ редиса').to.have.property(config.REDIS.KEY)

                authCookie.headers.cookie = `${config.REDIS.KEY}=${cookies[config.REDIS.KEY]}`
            })
    })

    describe("Тест существования статики", () => {
        let imgArr = []

        it("Получение списка картинок",async () => {
            return request(app)
                .get('/templates/images')
                .set('cookie',authCookie)
                .expect(200)
                .then(response => {
                    const respdata = response.data

                    expect(respdata, 'Ответ апи должен быть успешным').to.have.property('message').equal('ok')
                    expect(respdata.result, 'Картинки должны быть массивом').to.be.an('array')

                    imgArr = respdata.result
                })
        })

        it('Первая картинка доступна',async () => {
            return request(app)
                .get(`/${imgArr[0]}`)
                .set('cookie',authCookie)
                .expect(200)
        })
    })

    describe("Тест работы с шаблонами", () => {

        it("Получение списка шаблонов", () => {
            return request(app)
                .get('/templates/')
                .set('cookie',authCookie)
                .expect(200)
                .then(response => {
                    const respdata = response.data

                    expect(respdata, 'Ответ апи должен быть успешным').to.have.property('message').equal('ok')

                    if (process.env.IS_FAIL) {
                        expect(respdata.result, 'Список шаблонов должен быть массивом').to.be.an('string')
                    } else {
                        expect(respdata.result, 'Список шаблонов должен быть массивом').to.be.an('array')
                    }

                    imgArr = respdata.result
                })
        })

    })

})
