// File: data/repositories/NotificationRepository.js
const db = require('../db/db');

class NotificationRepository {
    create(userId, message) {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO notifications (userId, message, createdAt) VALUES (?, ?, ?)';
            const createdAt = new Date().toISOString();
            db.run(sql, [userId, message, createdAt], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, userId, message, createdAt });
            });
        });
    }

    findByUserId(userId) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT 10';
            db.all(sql, [userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

module.exports = new NotificationRepository();
