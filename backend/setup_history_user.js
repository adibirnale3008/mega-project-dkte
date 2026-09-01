const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupHistoryUserTables() {
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

        const createNewsChecksTableSQL = `
        CREATE TABLE IF NOT EXISTS news_checks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            news_text TEXT NOT NULL,
            prediction VARCHAR(50) NOT NULL,
            confidence FLOAT NOT NULL,
            api_verification TEXT NULL,
            ai_summary TEXT NULL,
            credibility_score INT DEFAULT 50,
            claim_category VARCHAR(100) DEFAULT 'Other',
            user_id INT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `;

        await connection.query(createNewsChecksTableSQL);
        console.log('[SUCCESS] `news_checks` table set up successfully.');
        await connection.end();
    } catch (error) {
        console.error('[ERROR] Failed to set up news_checks history table:', error.message);
    }
}

setupHistoryUserTables();
