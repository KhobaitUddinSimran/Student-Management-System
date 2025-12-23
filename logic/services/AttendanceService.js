// File: logic/services/AttendanceService.js
const AttendanceRepository = require('../../data/repositories/AttendanceRepository');
const NotificationRepository = require('../../data/repositories/NotificationRepository');

class AttendanceService {
    // Mark attendance for multiple students
    async markAttendance(date, attendanceList, teacherId) {
        const formattedList = attendanceList.map(a => ({
            studentId: a.studentId,
            date: date,
            status: a.status,
            markedBy: teacherId
        }));

        const result = await AttendanceRepository.markBatch(formattedList);

        // Notify parents of absent students
        await this.notifyAbsentStudents(date);

        return result;
    }

    // Notify parents of absent students
    async notifyAbsentStudents(date) {
        const absentStudents = await AttendanceRepository.getAbsentStudents(date);
        
        for (const student of absentStudents) {
            if (student.parentId) {
                await NotificationRepository.create(
                    student.parentId,
                    `Your child ${student.studentName} was marked ABSENT on ${date}.`,
                    'Attendance Alert',
                    'ATTENDANCE'
                );
                console.log(`[NOTIFICATION] Sent absence alert to parent of ${student.studentName}`);
            }
        }

        return absentStudents.length;
    }

    // Get attendance for a specific date
    async getAttendanceByDate(date) {
        return await AttendanceRepository.getByDate(date);
    }

    // Get student's attendance history
    async getStudentAttendance(studentId) {
        const attendance = await AttendanceRepository.getByStudent(studentId);
        const stats = await AttendanceRepository.getStudentStats(studentId);
        return { attendance, stats };
    }

    // Get all students for attendance marking
    async getStudentsForAttendance() {
        return await AttendanceRepository.getAllStudents();
    }
}

module.exports = new AttendanceService();
