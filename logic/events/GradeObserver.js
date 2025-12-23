// File: logic/events/GradeObserver.js
const NotificationRepository = require('../../data/repositories/NotificationRepository');
const UserRepository = require('../../data/repositories/UserRepository');

class GradeObserver {
    update(grade) {
        throw new Error("Method 'update' must be implemented.");
    }
}

class EmailNotificationObserver extends GradeObserver {
    update(grade) {
        console.log(`[Email Service] Sending email to parent of student ${grade.studentId}: New grade added in ${grade.subject} (${grade.score}).`);
    }
}

class ParentPortalObserver extends GradeObserver {
    async update(grade) {
        console.log(`[Parent Portal] Dashboard updated for student ${grade.studentId}. New grade: ${grade.score} in ${grade.subject}.`);
        
        // Find the student to get the parent ID
        try {
            const student = await UserRepository.findById(grade.studentId);
            if (student && student.parentId) {
                const message = `New Grade Alert: ${grade.subject} - ${grade.score}`;
                await NotificationRepository.create(student.parentId, message);
                console.log(`[Parent Portal] Notification saved for Parent ID ${student.parentId}`);
            }
            
            // Also notify the student
            const studentMsg = `You received a new grade in ${grade.subject}: ${grade.score}`;
            await NotificationRepository.create(grade.studentId, studentMsg);

        } catch (err) {
            console.error("Error in ParentPortalObserver:", err);
        }
    }
}

module.exports = { GradeObserver, EmailNotificationObserver, ParentPortalObserver };
