const io = require('socket.io-client');
const config = require('../config');
const logger = require('./logger');
const {getSessionCookie} = require('./auth');
const {sleep} = require('./helpers');
const db = require('./db/index');

let socket = null;

const getConnection = async () => {
    if (socket) return socket;
    const sessionCookie = await getSessionCookie();

    socket = io(config.WEBSOCKET_HOST, {transports: ['websocket'], extraHeaders: {cookie: sessionCookie}});

    socket.on('connect', (data) => {
        logger.trace('connect to ' + config.WEBSOCKET_HOST + ' success');
    });
    socket.on("connect_error", async (err) => {
        logger.debug(`socket error: ${err.message}`);
        socket && socket.close();
        socket = null
        await sleep(1000)
        getConnection()
    });
    socket.on('disconnect', () => {
        logger.debug('socket disconnect');
        socket && socket.close();
        socket = null
        getConnection()
    });
    socket.on('builder', (data) => {
        if ('site_id' in data && 'status' in data) {
            db.sites.changeActive(data.site_id, (data.status === 'success' || data.status === 'update') ? 1 : 0, data.status === 'update' ? 1 : 0)
                .catch(err => logger.error(err))
        }
        logger.debug('socket builder = ', data);
    });
    return socket;
};

module.exports = {getConnection};
