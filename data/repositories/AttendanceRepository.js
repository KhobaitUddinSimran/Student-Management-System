// File: data/repositories/AttendanceRepository.js
const db = require('../db/db');

class AttendanceRepository {
    // Mark attendance for a single student
    mark(attendanceData) {
        return new Promise((resolve, reject) => {
            const { studentId, date, status, markedBy } = attendanceData;
            db.run(
                `INSERT OR REPLACE INTO attendance (studentId, date, status, markedBy, createdAt) 
                 VALUES (?, ?, ?, ?, datetime('now'))`,
                [studentId, date, status, markedBy],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, ...attendanceData });
                }
            );
        });
    }

    // Mark attendance for multiple students (batch)
    markBatch(attendanceList) {
        return new Promise((resolve, reject) => {
            const stmt = db.prepare(
                `INSERT OR REPLACE INTO attendance (studentId, date, status, markedBy, createdAt) 
                 VALUES (?, ?, ?, ?, datetime('now'))`
            );
            
            attendanceList.forEach(a => {
                stmt.run([a.studentId, a.date, a.status, a.markedBy]);
            });
            
            stmt.finalize(err => {
                if (err) reject(err);
                else resolve({ count: attendanceList.length });
            });
        });
    }

    // Get attendance by date
    getByDate(date) {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT a.*, u.name as studentName 
                FROM attendance a
                JOIN users u ON a.studentId = u.id
                WHERE a.date = ?
                ORDER BY u.name
            `, [date], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Get attendance by student
    getByStudent(studentId) {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT * FROM attendance 
                WHERE studentId = ?
                ORDER BY date DESC
            `, [studentId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Get attendance statistics for a student
    getStudentStats(studentId) {
        return new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    COUNT(*) as totalDays,
                    SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END) as presentDays,
                    SUM(CASE WHEN status = 'ABSENT' THEN 1 ELSE 0 END) as absentDays,
                    SUM(CASE WHEN status = 'LATE' THEN 1 ELSE 0 END) as lateDays
                FROM attendance
                WHERE studentId = ?
            `, [studentId], (err, row) => {
                if (err) reject(err);
                else {
                    const stats = row || { totalDays: 0, presentDays: 0, absentDays: 0, lateDays: 0 };
                    stats.attendancePercentage = stats.totalDays > 0 
                        ? ((stats.presentDays / stats.totalDays) * 100).toFixed(2) 
                        : 0;
                    resolve(stats);
                }
            });
        });
    }

    // Get absent students for a specific date (for notifications)
    getAbsentStudents(date) {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT a.*, u.name as studentName, u.parentId
                FROM attendance a
                JOIN users u ON a.studentId = u.id
                WHERE a.date = ? AND a.status = 'ABSENT'
            `, [date], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Get all students for marking attendance
    getAllStudents() {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT id, name, email FROM users 
                WHERE role = 'STUDENT'
                ORDER BY name
            `, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Get attendance statistics for a class
    getClassStats(classId) {
        return new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    COUNT(*) as totalRecords,
                    SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) as present,
                    SUM(CASE WHEN a.status = 'ABSENT' THEN 1 ELSE 0 END) as absent,
                    SUM(CASE WHEN a.status = 'LATE' THEN 1 ELSE 0 END) as late
                FROM attendance a
                JOIN student_classes sc ON a.studentId = sc.studentId
                WHERE sc.classId = ?
            `, [classId], (err, row) => {
                if (err) reject(err);
                else {
                    const stats = row || { totalRecords: 0, present: 0, absent: 0, late: 0 };
                    stats.presentPercentage = stats.totalRecords > 0
                        ? ((stats.present / stats.totalRecords) * 100).toFixed(2)
                        : 0;
                    resolve(stats);
                }
            });
        });
    }
}

module.exports = new AttendanceRepository();
