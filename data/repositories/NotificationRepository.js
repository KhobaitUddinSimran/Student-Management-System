// File: data/repositories/NotificationRepository.js
const db = require('../db/db');

class NotificationRepository {
    // Create a notification with full options
    create(userId, message, title = null, type = 'GENERAL') {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO notifications (userId, title, message, type, isRead, createdAt) VALUES (?, ?, ?, ?, 0, ?)';
            const createdAt = new Date().toISOString();
            db.run(sql, [userId, title, message, type, createdAt], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, userId, title, message, type, isRead: false, createdAt });
            });
        });
    }

    // Create notification for multiple users (batch)
    createBatch(notifications) {
        return new Promise((resolve, reject) => {
            const stmt = db.prepare(
                'INSERT INTO notifications (userId, title, message, type, isRead, createdAt) VALUES (?, ?, ?, ?, 0, ?)'
            );
            const createdAt = new Date().toISOString();
            
            notifications.forEach(n => {
                stmt.run([n.userId, n.title || null, n.message, n.type || 'GENERAL', createdAt]);
            });
            
            stmt.finalize(err => {
                if (err) reject(err);
                else resolve({ count: notifications.length });
            });
        });
    }

    // Get all notifications for a user
    findByUserId(userId, limit = 50) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT ?';
            db.all(sql, [userId, limit], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Get unread notifications for a user
    findUnreadByUserId(userId) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM notifications WHERE userId = ? AND isRead = 0 ORDER BY createdAt DESC';
            db.all(sql, [userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Get unread count for a user
    getUnreadCount(userId) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = 0';
            db.get(sql, [userId], (err, row) => {
                if (err) reject(err);
                else resolve(row ? row.count : 0);
            });
        });
    }

    // Get notifications by type
    findByType(userId, type) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM notifications WHERE userId = ? AND type = ? ORDER BY createdAt DESC';
            db.all(sql, [userId, type], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Mark notification as read
    markAsRead(notificationId) {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE notifications SET isRead = 1 WHERE id = ?';
            db.run(sql, [notificationId], function(err) {
                if (err) reject(err);
                else resolve({ updated: this.changes });
            });
        });
    }

    // Mark all notifications as read for a user
    markAllAsRead(userId) {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE notifications SET isRead = 1 WHERE userId = ?';
            db.run(sql, [userId], function(err) {
                if (err) reject(err);
                else resolve({ updated: this.changes });
            });
        });
    }

    // Delete a notification
    delete(notificationId) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM notifications WHERE id = ?';
            db.run(sql, [notificationId], function(err) {
                if (err) reject(err);
                else resolve({ deleted: this.changes });
            });
        });
    }

    // Delete all notifications for a user
    deleteAllByUser(userId) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM notifications WHERE userId = ?';
            db.run(sql, [userId], function(err) {
                if (err) reject(err);
                else resolve({ deleted: this.changes });
            });
        });
    }

    // Get notification summary (counts by type)
    getSummary(userId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    type,
                    COUNT(*) as total,
                    SUM(CASE WHEN isRead = 0 THEN 1 ELSE 0 END) as unread
                FROM notifications
                WHERE userId = ?
                GROUP BY type
            `;
            db.all(sql, [userId], (err, rows) => {
                if (err) reject(err);
                else {
                    const summary = {
                        total: 0,
                        unread: 0,
                        byType: {}
                    };
                    rows.forEach(row => {
                        summary.total += row.total;
                        summary.unread += row.unread;
                        summary.byType[row.type] = {
                            total: row.total,
                            unread: row.unread
                        };
                    });
                    resolve(summary);
                }
            });
        });
    }
}

module.exports = new NotificationRepository();
