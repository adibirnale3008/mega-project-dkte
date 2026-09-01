const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    google_id: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    profile_picture: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: true  // null for Google-only users
    },
    auth_provider: {
        type: DataTypes.ENUM('google', 'local'),
        allowNull: false,
        defaultValue: 'google'
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = User;
