const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '3306');
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'fake_news_db';

// Initialize Sequelize ORM with MySQL 8.x compatibility
const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
        // Required for MySQL 8.x with caching_sha2_password or mysql_native_password
        connectTimeout: 10000,
        ssl: false
    },
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// Auto-create database and connect with retry
async function initSequelize() {
    try {
        // Step 1: Connect to MySQL server and create DB if missing
        const rootConn = await mysql.createConnection({
            host: dbHost,
            port: dbPort,
            user: dbUser,
            password: dbPassword,
            connectTimeout: 10000
        });
        await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        await rootConn.end();

        // Step 2: Authenticate Sequelize
        await sequelize.authenticate();
        console.log(`[ORM SUCCESS] Sequelize connected to MySQL database "${dbName}" on ${dbHost}:${dbPort}.`);
    } catch (err) {
        console.log(`[ORM NOTICE] MySQL not connected on ${dbHost}:${dbPort}. Reason: ${err.message}`);
        console.log(`[ORM NOTICE] System running in DB-Free mode. Start MySQL and restart the server to enable database features.`);
    }
}

initSequelize();

module.exports = sequelize;

