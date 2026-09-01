const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const NewsCheck = sequelize.define('NewsCheck', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    news_text: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    prediction: {
        type: DataTypes.ENUM('Fake', 'Real'),
        allowNull: true
    },
    confidence: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    api_verification: {
        type: DataTypes.STRING,
        defaultValue: 'Pending'
    },
    ai_summary: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    credibility_score: {
        type: DataTypes.INTEGER,
        defaultValue: 50
    },
    claim_category: {
        type: DataTypes.STRING(50),
        defaultValue: 'Other'
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'news_checks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = NewsCheck;
