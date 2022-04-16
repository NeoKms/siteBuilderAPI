const express = require('express');
const cookieParser = require('cookie-parser');
const config = require('./src/config');
const bodyParser = require('body-parser');
const app = express();
const morgan = require('morgan');

require("./src/modules/sentry")(app);

const logger = require('./src/modules/logger');

require('./src/modules/session')(app);

app
    .use(bodyParser.urlencoded())
    .use(bodyParser.json())
    .use(cookieParser())
    .use(morgan(':remote-addr - :remote-user [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" - :response-time ms'));


require('./src/routes')(app);

if (require('fs').existsSync('./doc/index.html')) {
    app.use(express.static('./doc'));
    app.use('/apidoc', express.static(__dirname + '/doc'));
}

app.listen(config.PORT, '0.0.0.0', () => {
    logger.info(`server runing port: ${config.PORT}`);
    require('./src/modules/websocket').getConnection();
});
