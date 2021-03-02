const io = require('socket.io-client');
const config = require('../config');
const logger = require('./logger');
const auth = require('./auth').getSessionCookie();

let socket = null;

const getConnection = async function () {
    if (socket) return socket;
    const sessionCookie = await auth();
    socket = io(config.WS.URL, {transports: ['websocket'], extraHeaders: {cookie: sessionCookie}});

    socket.on('connect', (data) => {
        logger.debug('connect to ' + config.WS.URL + ' success');
    });
    socket.on('disconnect', () => {
        logger.info('socket disconnect');
    });
    socket.on('test', (data) => {
        logger.debug('socket test = ', data);
    });
    socket.sendExample = function (data) {
        socket.emit('example', data);
    };

    return socket;
};

module.exports.getConnection = getConnection;
