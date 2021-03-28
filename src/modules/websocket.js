const io = require('socket.io-client');
const config = require('../config');
const logger = require('./logger');
const auth = require('./auth').getSessionCookie;
const db = require('./db/index');

let socket = null;

const getConnection = async function () {
    if (socket) return socket;
    const sessionCookie = await auth();

    socket = io(config.WEBSOCKET_HOST, {transports: ['websocket'], extraHeaders: {cookie: sessionCookie}});

    socket.on('connect', (data) => {
        logger.debug('connect to ' + config.WEBSOCKET_HOST + ' success');
    });
    socket.on('disconnect', () => {
        logger.info('socket disconnect');
    });
    socket.on('builder', (data) => {
        if ('site_id' in data && 'status' in data) {
            db.sites.changeActive(data.site_id,data.status==='success'? 1 : 0)
                .catch(err=>logger.error(err))
        }
        logger.debug('socket builder = ', data);
    });
    return socket;
};

module.exports.getConnection = getConnection;
