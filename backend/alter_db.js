const mysql = require('mysql2/promise');
require('dotenv').config();

async function alterDatabaseSchema() {
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = parseInt(process.env.DB_PORT || '3306');
    const dbUser = process.env.DB_USER || 'root';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbName = process.env.DB_NAME || 'fake_news_db';

    try {
        console.log(`Connecting to MySQL database "${dbName}"...`);
        const connection = await mysql.createConnection({
            host: dbHost,
            port: dbPort,
            user: dbUser,
            password: dbPassword,
            database: dbName
        });

        const alterQueries = [
            "ALTER TABLE news_checks ADD COLUMN claim_category VARCHAR(100) DEFAULT 'Other';",
            "ALTER TABLE news_checks ADD COLUMN user_id INT NULL;",
            "ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL;",
            "ALTER TABLE users ADD COLUMN auth_provider ENUM('local', 'google') DEFAULT 'local';"
        ];

        for (const query of alterQueries) {
            try {
                await connection.query(query);
                console.log(`[APPLIED] Executed: ${query}`);
            } catch (err) {
                // Ignore column already exists errors (Duplicate column name)
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log(`[EXISTS] Column already present.`);
                } else {
                    console.log(`[NOTICE] ${err.message}`);
                }
            }
        }

        console.log('[SUCCESS] Database schema migration completed.');
        await connection.end();
    } catch (error) {
        console.error('[ERROR] Failed to execute database alterations:', error.message);
    }
}

alterDatabaseSchema();
