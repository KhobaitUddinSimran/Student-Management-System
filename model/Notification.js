// File: model/Notification.js
class Notification {
    // Notification types
    static TYPES = {
        ATTENDANCE: 'ATTENDANCE',
        GRADE: 'GRADE',
        ANNOUNCEMENT: 'ANNOUNCEMENT',
        SYSTEM: 'SYSTEM',
        GENERAL: 'GENERAL'
    };

    constructor(id, userId, title, message, type = 'GENERAL', isRead = false, createdAt = null) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.message = message;
        this.type = type;
        this.isRead = isRead;
        this.createdAt = createdAt || new Date().toISOString();
    }

    // Mark as read
    markAsRead() {
        this.isRead = true;
    }

    // Check if notification is of a specific type
    isType(type) {
        return this.type === type;
    }
}

module.exports = Notification;
