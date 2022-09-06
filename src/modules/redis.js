const config = require("../config");
const redis = require("redis");
const RedisClient = redis.createClient({
  host: config.REDIS.HOST,
  port: config.REDIS.PORT,
});
const { promisify } = require("util");
const redisGetAsync = promisify(RedisClient.get).bind(RedisClient);
const redisSetAsync = promisify(RedisClient.set).bind(RedisClient);
const redisSetExpire = promisify(RedisClient.expire).bind(RedisClient);

RedisClient.on("error", function (err) {
  console.error("Error redis " + err);
});

module.exports = {redisGetAsync,redisSetAsync,redisSetExpire};
