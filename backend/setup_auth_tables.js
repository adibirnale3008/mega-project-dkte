const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupAuthTables() {
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = parseInt(process.env.DB_PORT || '3306');
    const dbUser = process.env.DB_USER || 'root';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbName = process.env.DB_NAME || 'fake_news_db';

    try {
        console.log(`Connecting to MySQL at ${dbHost}:${dbPort}...`);
        const connection = await mysql.createConnection({
            host: dbHost,
            port: dbPort,
            user: dbUser,
            password: dbPassword
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        await connection.query(`USE \`${dbName}\`;`);

        const createUsersTableSQL = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            google_id VARCHAR(255) NULL UNIQUE,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NULL,
            auth_provider ENUM('local', 'google') DEFAULT 'local',
            profile_picture TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `;

        await connection.query(createUsersTableSQL);
        console.log('[SUCCESS] `users` table set up successfully.');
        await connection.end();
    } catch (error) {
        console.error('[ERROR] Failed to set up auth tables:', error.message);
    }
}

setupAuthTables();
