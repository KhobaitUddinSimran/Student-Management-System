// File: logic/services/NotificationService.js
const NotificationRepository = require('../../data/repositories/NotificationRepository');
const UserRepository = require('../../data/repositories/UserRepository');
const Notification = require('../../model/Notification');

class NotificationService {
    // ========== SEND NOTIFICATIONS ==========

    // Send notification to a single user
    async sendNotification(userId, message, title = null, type = 'GENERAL') {
        return await NotificationRepository.create(userId, message, title, type);
    }

    // Send notification to multiple users
    async sendBulkNotification(userIds, message, title = null, type = 'GENERAL') {
        const notifications = userIds.map(userId => ({
            userId,
            title,
            message,
            type
        }));
        return await NotificationRepository.createBatch(notifications);
    }

    // Send announcement to all users (or specific role)
    async sendAnnouncement(message, title, role = null) {
        let users;
        if (role) {
            users = await UserRepository.findAllByRole(role);
        } else {
            users = await UserRepository.findAll();
        }

        const notifications = users.map(user => ({
            userId: user.id,
            title: title || 'Announcement',
            message,
            type: 'ANNOUNCEMENT'
        }));

        return await NotificationRepository.createBatch(notifications);
    }

    // ========== SPECIFIC NOTIFICATION TYPES ==========

    // Send attendance notification (for absences)
    async sendAttendanceNotification(userId, studentName, date, status) {
        const title = 'Attendance Alert';
        const message = `${studentName} was marked ${status} on ${date}.`;
        return await this.sendNotification(userId, message, title, 'ATTENDANCE');
    }

    // Send grade notification
    async sendGradeNotification(userId, studentName, subject, score) {
        const title = 'New Grade Posted';
        const message = `${studentName} received a score of ${score} in ${subject}.`;
        return await this.sendNotification(userId, message, title, 'GRADE');
    }

    // Send system notification
    async sendSystemNotification(userId, message, title = 'System Notice') {
        return await this.sendNotification(userId, message, title, 'SYSTEM');
    }

    // ========== READ NOTIFICATIONS ==========

    // Get all notifications for a user
    async getUserNotifications(userId, limit = 50) {
        return await NotificationRepository.findByUserId(userId, limit);
    }

    // Get unread notifications
    async getUnreadNotifications(userId) {
        return await NotificationRepository.findUnreadByUserId(userId);
    }

    // Get unread count
    async getUnreadCount(userId) {
        return await NotificationRepository.getUnreadCount(userId);
    }

    // Get notifications by type
    async getNotificationsByType(userId, type) {
        return await NotificationRepository.findByType(userId, type);
    }

    // Get notification summary
    async getNotificationSummary(userId) {
        return await NotificationRepository.getSummary(userId);
    }

    // Get notifications with unread count (combined response)
    async getNotificationsWithCount(userId, limit = 50) {
        const notifications = await this.getUserNotifications(userId, limit);
        const unreadCount = await this.getUnreadCount(userId);
        const summary = await this.getNotificationSummary(userId);

        return {
            notifications,
            unreadCount,
            summary
        };
    }

    // ========== MANAGE NOTIFICATIONS ==========

    // Mark notification as read
    async markAsRead(notificationId) {
        return await NotificationRepository.markAsRead(notificationId);
    }

    // Mark all as read
    async markAllAsRead(userId) {
        return await NotificationRepository.markAllAsRead(userId);
    }

    // Delete notification
    async deleteNotification(notificationId) {
        return await NotificationRepository.delete(notificationId);
    }

    // Clear all notifications for user
    async clearAllNotifications(userId) {
        return await NotificationRepository.deleteAllByUser(userId);
    }
}

module.exports = new NotificationService();
