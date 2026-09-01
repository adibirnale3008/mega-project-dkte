const sequelize = require('../config/db');
const User = require('./User');
const NewsCheck = require('./NewsCheck');

// Define Relationships
User.hasMany(NewsCheck, { foreignKey: 'user_id', onDelete: 'SET NULL' });
NewsCheck.belongsTo(User, { foreignKey: 'user_id', onDelete: 'SET NULL' });

// Auto-sync Database Models
async function syncDatabase() {
    try {
        await sequelize.sync({ alter: true });
        console.log('[ORM SYNC] All database models synchronized successfully.');
    } catch (err) {
        // Handled silently in DB-Free mode
    }
}

syncDatabase();

module.exports = {
    sequelize,
    User,
    NewsCheck
};
