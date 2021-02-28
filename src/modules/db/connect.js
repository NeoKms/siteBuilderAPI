const mysql = require('mysql');
const util = require('util');
const config = require('../../config')
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = config.DB
const logger = require('../logger')

const conf = {
    type: 'mysql',
    multipleStatements: true,
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    connectionLimit: 10,
};

const pool = mysql.createPool(conf);
pool.query = util.promisify(pool.query);

const connection = () => new Promise((resolve, reject) => {
    pool.getConnection((err, con) => {
        if (err) {
            logger.error(err,'pool.getConnection:');
            reject(err);
        }
        const query = (sql, binding) => new Promise((resolve, reject) => {
            con.query(sql, binding, (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
        const release = () => new Promise((resolve, reject) => {
            if (err) reject(err);
            resolve(con.release());
        });
        const beginTransaction = () => util.promisify(con.beginTransaction).call(con);
        const commit = () => util.promisify(con.commit).call(con);
        const rollback = () => util.promisify(con.rollback).call(con);
        resolve({
            query, release, beginTransaction, commit, rollback,
        });
    });
});

const query = (sql, binding) => new Promise((resolve, reject) => {
    pool.query(sql, binding, (err, result, fields) => {
        if (err) reject(err);
        resolve(result);
    });
});

module.exports = { pool, connection, query };
