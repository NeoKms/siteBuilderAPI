process.env.IS_TEST = true
const app = require('./app')
const axios = require('axios')
const config = require('./src/config')
const cookie = require('cookie')
const chai = require("chai")
const chaiAsPromised = require("chai-as-promised")
chai.use(chaiAsPromised)
const expect = chai.expect
const assert = chai.assert
let authCookie = {
    timeout: 500,
    headers: {
        cookie: 'authCookie',
    }
}
const localApiUrl = `http://localhost:${config.PORT}`

describe("Тест авторизации", () => {
    it("Прохождение авторизации", () => {
        return axios.post(`${localApiUrl}/auth/login`, {
            "username": config.AUTH.LOGIN,
            "password": config.AUTH.PASSWORD,
        }, authCookie)
            .then(response => {
                const authData = response.data

                expect(authData, 'Ответ апи должен быть успешным').to.have.property('message').equal('ok')
                expect(response.headers, 'Куки должен существовать').to.have.property('set-cookie').that.lengthOf(1)

                const cookies = cookie.parse(response.headers['set-cookie'][0])

                expect(cookies, 'Куки должен иметь ключ редиса').to.have.property(config.REDIS.KEY)

                authCookie.headers.cookie = `${config.REDIS.KEY}=${cookies[config.REDIS.KEY]}`
            })
    })

    it("Прохождение аутентификации", () => {
        return axios.get(`${localApiUrl}/auth/checkLogin`, authCookie)
    })

    it("Логаут", () => {
        return axios.get(`${localApiUrl}/auth/logout`, authCookie)
            .then(noRes => {
                return axios.get(`${localApiUrl}/auth/checkLogin`, authCookie)
                    .then(res => {
                        expect(res.status, 'Проверка аутентификации должна отдать код 403').to.equal(403)
                    })
                    .catch(err => err)
            })
    })
})

describe("Тест шаблонов", () => {

    it("Прохождение авторизации", () => {
        return axios.post(`${localApiUrl}/auth/login`, {
            "username": config.AUTH.LOGIN,
            "password": config.AUTH.PASSWORD,
        }, authCookie)
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

        it("Получение списка картинок", () => {
            return axios.get(`${localApiUrl}/templates/images`, authCookie)
                .then(response => {
                    const respdata = response.data

                    expect(respdata, 'Ответ апи должен быть успешным').to.have.property('message').equal('ok')
                    expect(respdata.result, 'Картинки должны быть массивом').to.be.an('array')

                    imgArr = respdata.result
                })
        })

        it('Первая картинка доступна', () => {
            return axios.get(`${localApiUrl}/${imgArr[0]}`, authCookie)
        })

        it("Получение списка шаблонов", () => {
            return axios.get(`${localApiUrl}/templates/`, authCookie)
                .then(response => {
                    const respdata = response.data

                    expect(respdata, 'Ответ апи должен быть успешным').to.have.property('message').equal('ok')
                    expect(respdata.result, 'Картинки должны быть массивом').to.be.an('array')

                    imgArr = respdata.result
                })
        })
    })
})
