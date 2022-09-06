const rabbitmq = require("./rabbit");

const toDataProcessor = rabbitmq.createWriter("dataProcessor");

module.exports = {
  toDataProcessor
};


