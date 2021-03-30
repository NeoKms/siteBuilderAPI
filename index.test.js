const app = require('./app')
const assert = require('assert').strict
const axios = require('axios')
const config = require('./src/config')
axios.defaults.withCredentials = true
const cookie = require('cookie')
function endOfTest(code=0) {
    setTimeout(()=>{
        process.exit(code)
    },2000)
}
const localApiUrl = 'http://api.test.lan:3001'

describe("Тест авторизации", async () => {
    let authCookie = {
        headers: {
            cookie: 'authCookie'
        }
    }
    it("Прохождение авторизации", (done) => {
        axios.post(`${localApiUrl}/auth/login`, {
            "username": config.AUTH.LOGIN,
            "password": config.AUTH.PASSWORD,
        })
            .then(response => {
                const authData = response.data
                assert(authData !== false)
                assert(response.headers['set-cookie'] && response.headers['set-cookie'].length > 0)
                const cookies = cookie.parse(response.headers['set-cookie'][0])
                assert(typeof cookies[config.REDIS.KEY] === 'string')
                authCookie.headers.cookie = `${config.REDIS.KEY}=${cookies[config.REDIS.KEY]}`
                done()
            })
            .catch(err=>{
                endOfTest(1)
                done(err)
            })
    })
    it("Прохождение аутентификации", (done) => {
        axios.get(`${localApiUrl}/auth/checkLogin`, authCookie)
            .then(response => {
                done()
            })
            .catch(err=>{
                endOfTest(1)
                done(err)
            })
    })
    it("Логаут", (done) => {
        axios.get(`${localApiUrl}/auth/logout`, authCookie)
            .then( noRes => {
                return axios.get(`${localApiUrl}/auth/checkLogin`, authCookie)
                    .then( res => {
                        done(new Error('Не прошел логаут'))
                    })
                    .catch( err => done())
            })
            .catch(err=>{
                endOfTest(1)
                done(err)
            })
    })
    endOfTest()
})

describe("Тест существования статики", async () => {
    let authCookie = {
        headers: {
            cookie: 'authCookie'
        }
    }
    it("Прохождение авторизации", (done) => {
        axios.post(`${localApiUrl}/auth/login`, {
            "username": config.AUTH.LOGIN,
            "password": config.AUTH.PASSWORD,
        })
            .then(response => {
                const authData = response.data
                assert(authData !== false)
                assert(response.headers['set-cookie'] && response.headers['set-cookie'].length > 0)
                const cookies = cookie.parse(response.headers['set-cookie'][0])
                assert(typeof cookies[config.REDIS.KEY] === 'string')
                authCookie.headers.cookie = `${config.REDIS.KEY}=${cookies[config.REDIS.KEY]}`
                done()
            })
            .catch(err=>{
                endOfTest(1)
                done(err)
            })
    })
    it("Получение списка картинок", (done) => {
        axios.get(`${localApiUrl}/templates/images`, authCookie)
            .then(response => {
                const data = response.data
                assert.equal(data.message,'ok')
                assert(Array.isArray(data.result))
                done()
            })
            .catch(err=>{
                endOfTest(1)
                done(err)
            })
    })
})
