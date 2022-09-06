process.env.IS_TEST = true;
const request = require("supertest");
const app = require("./app");
const config = require("./src/config");
const cookie = require("cookie");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;
let authCookieHeader = {
  cookie: "authCookie",
};

describe("Тест авторизации", () => {
  it("Прохождение авторизации", () => {
    return request(app)
      .post("/auth/login")
      .send({
        "username": config.AUTH.LOGIN,
        "password": config.AUTH.PASSWORD,
      })
      .expect(200)
      .expect("Content-Type", /json/)
      .then(response => {
        const authData = response.body;

        expect(authData, "Ответ апи должен быть успешным").to.have.property("message").equal("ok");
        expect(response.headers, "Куки должен существовать").to.have.property("set-cookie").that.lengthOf(1);

        const cookies = cookie.parse(response.headers["set-cookie"][0]);

        expect(cookies, "Куки должен иметь ключ редиса").to.have.property(config.REDIS.KEY);

        authCookieHeader.cookie = `${config.REDIS.KEY}=${cookies[config.REDIS.KEY]}`;
      });
  });

  it("Прохождение аутентификации", () => {
    return request(app)
      .get("/auth/checkLogin")
      .set(authCookieHeader)
      .expect(200).expect("Content-Type", /json/)
      .then(({body}) => {
        expect(body, "Ответ апи должен быть успешным").to.have.property("message").equal("ok");
      });
  });

  it("Логаут", () => {
    return request(app)
      .get("/auth/logout")
      .set(authCookieHeader)
      .expect(200).expect("Content-Type", /json/);
  });

  it("Логаут был успешен", () => {
    return request(app)
      .get("/auth/checkLogin")
      .set(authCookieHeader)
      .expect(403).expect("Content-Type", /json/);
  });
});

describe("Тест шаблонов", () => {

  it("Прохождение авторизации", () => {
    return request(app)
      .post("/auth/login")
      .send({
        "username": config.AUTH.LOGIN,
        "password": config.AUTH.PASSWORD,
      })
      .set(authCookieHeader)
      .expect(200)
      .expect("Content-Type", /json/)
      .then(response => {
        const authData = response.body;

        expect(authData, "Ответ апи должен быть успешным").to.have.property("message").equal("ok");
        expect(response.headers, "Куки должен существовать").to.have.property("set-cookie").that.lengthOf(1);

        const cookies = cookie.parse(response.headers["set-cookie"][0]);

        expect(cookies, "Куки должен иметь ключ редиса").to.have.property(config.REDIS.KEY);

        authCookieHeader.cookie = `${config.REDIS.KEY}=${cookies[config.REDIS.KEY]}`;
      });
  });

  describe("Тест существования статики", () => {
    let imgArr = [];

    it("Получение списка картинок", () => {
      return request(app)
        .get("/templates/images")
        .set(authCookieHeader)
        .expect(200)
        .expect("Content-Type", /json/)
        .then(response => {
          const respdata = response.body;

          expect(respdata, "Ответ апи должен быть успешным").to.have.property("message").equal("ok");
          expect(respdata.result, "Картинки должны быть массивом").to.be.an("array");

          imgArr = respdata.result;
        });
    });

    it("Первая картинка доступна", () => {
      return request(app)
        .get(`/${imgArr[0]}`)
        .set(authCookieHeader)
        .expect(200)
        .expect("Content-Type", /image/);
    });
  });

  describe("Тест работы с шаблонами", () => {

    it("Получение списка шаблонов", () => {
      return request(app)
        .get("/templates/")
        .set(authCookieHeader)
        .expect(200)
        .expect("Content-Type", /json/)
        .then(response => {
          const respdata = response.body;

          expect(respdata, "Ответ апи должен быть успешным").to.have.property("message").equal("ok");

          if (process.env.IS_FAIL) {
            expect(respdata.result, "Список шаблонов должен быть массивом").to.be.an("string");
          } else {
            expect(respdata.result, "Список шаблонов должен быть массивом").to.be.an("array");
          }

        });
    });

  });

});
