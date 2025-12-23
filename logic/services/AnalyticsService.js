// File: logic/services/AnalyticsService.js
const db = require('../../data/db/db');
const AttendanceRepository = require('../../data/repositories/AttendanceRepository');
const GradeRepository = require('../../data/repositories/GradeRepository');
const ClassRepository = require('../../data/repositories/ClassRepository');

class AnalyticsService {
    // Get overall dashboard statistics
    async getDashboardStats() {
        const userStats = await this.getUserStats();
        const attendanceStats = await this.getOverallAttendanceStats();
        const gradeDistribution = await this.getOverallGradeDistribution();
        const classCount = await this.getClassCount();

        return {
            users: userStats,
            classes: classCount,
            attendance: attendanceStats,
            gradeDistribution: gradeDistribution
        };
    }

    // Get user counts by role
    getUserStats() {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT role, COUNT(*) as count 
                FROM users 
                GROUP BY role
            `, [], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }

                const stats = {
                    total: 0,
                    ADMIN: 0,
                    TEACHER: 0,
                    STUDENT: 0,
                    PARENT: 0
                };

                rows.forEach(row => {
                    stats[row.role] = row.count;
                    stats.total += row.count;
                });

                resolve(stats);
            });
        });
    }

    // Get class count
    getClassCount() {
        return new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as count FROM classes', [], (err, row) => {
                if (err) reject(err);
                else resolve(row ? row.count : 0);
            });
        });
    }

    // Get overall attendance statistics
    getOverallAttendanceStats() {
        return new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    COUNT(*) as totalRecords,
                    SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END) as present,
                    SUM(CASE WHEN status = 'ABSENT' THEN 1 ELSE 0 END) as absent,
                    SUM(CASE WHEN status = 'LATE' THEN 1 ELSE 0 END) as late
                FROM attendance
            `, [], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }

                const stats = row || { totalRecords: 0, present: 0, absent: 0, late: 0 };
                stats.presentPercentage = stats.totalRecords > 0
                    ? ((stats.present / stats.totalRecords) * 100).toFixed(2)
                    : 0;
                stats.absentPercentage = stats.totalRecords > 0
                    ? ((stats.absent / stats.totalRecords) * 100).toFixed(2)
                    : 0;
                stats.latePercentage = stats.totalRecords > 0
                    ? ((stats.late / stats.totalRecords) * 100).toFixed(2)
                    : 0;

                resolve(stats);
            });
        });
    }

    // Get overall grade distribution
    getOverallGradeDistribution() {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    CASE 
                        WHEN score >= 90 THEN 'A'
                        WHEN score >= 80 THEN 'B'
                        WHEN score >= 70 THEN 'C'
                        WHEN score >= 60 THEN 'D'
                        ELSE 'F'
                    END as grade,
                    COUNT(*) as count
                FROM grades
                GROUP BY grade
                ORDER BY grade
            `, [], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }

                // Initialize all grades
                const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
                let total = 0;

                rows.forEach(row => {
                    distribution[row.grade] = row.count;
                    total += row.count;
                });

                // Calculate percentages
                const percentages = {};
                Object.keys(distribution).forEach(grade => {
                    percentages[grade] = total > 0
                        ? ((distribution[grade] / total) * 100).toFixed(2)
                        : 0;
                });

                resolve({
                    counts: distribution,
                    percentages: percentages,
                    total: total
                });
            });
        });
    }

    // Get attendance statistics for a specific class
    async getClassAttendanceStats(classId) {
        return await AttendanceRepository.getClassStats(classId);
    }

    // Get grade distribution for a specific class
    getClassGradeDistribution(classId) {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    CASE 
                        WHEN g.score >= 90 THEN 'A'
                        WHEN g.score >= 80 THEN 'B'
                        WHEN g.score >= 70 THEN 'C'
                        WHEN g.score >= 60 THEN 'D'
                        ELSE 'F'
                    END as grade,
                    COUNT(*) as count
                FROM grades g
                JOIN student_classes sc ON g.studentId = sc.studentId
                WHERE sc.classId = ?
                GROUP BY grade
                ORDER BY grade
            `, [classId], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }

                const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
                let total = 0;

                rows.forEach(row => {
                    distribution[row.grade] = row.count;
                    total += row.count;
                });

                resolve({
                    counts: distribution,
                    total: total
                });
            });
        });
    }

    // Get class analytics (students, attendance, grades)
    async getClassAnalytics(classId) {
        const classInfo = await ClassRepository.findById(classId);
        const students = await ClassRepository.getStudentsByClass(classId);
        const attendanceStats = await this.getClassAttendanceStats(classId);
        const gradeDistribution = await this.getClassGradeDistribution(classId);

        return {
            class: classInfo,
            studentCount: students.length,
            students: students,
            attendance: attendanceStats,
            gradeDistribution: gradeDistribution
        };
    }

    // Get teacher analytics (their classes and students)
    async getTeacherAnalytics(teacherId) {
        const classes = await ClassRepository.findByTeacher(teacherId);
        
        const classAnalytics = [];
        for (const cls of classes) {
            const analytics = await this.getClassAnalytics(cls.id);
            classAnalytics.push(analytics);
        }

        const totalStudents = classAnalytics.reduce((sum, c) => sum + c.studentCount, 0);

        return {
            teacherId: teacherId,
            classCount: classes.length,
            totalStudents: totalStudents,
            classes: classAnalytics
        };
    }

    // Get recent attendance trends (last 7 days)
    getAttendanceTrends(days = 7) {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    date,
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END) as present,
                    SUM(CASE WHEN status = 'ABSENT' THEN 1 ELSE 0 END) as absent,
                    SUM(CASE WHEN status = 'LATE' THEN 1 ELSE 0 END) as late
                FROM attendance
                WHERE date >= date('now', '-${days} days')
                GROUP BY date
                ORDER BY date DESC
            `, [], (err, rows) => {
                if (err) reject(err);
                else {
                    const trends = rows.map(row => ({
                        date: row.date,
                        total: row.total,
                        present: row.present,
                        absent: row.absent,
                        late: row.late,
                        presentPercentage: row.total > 0 
                            ? ((row.present / row.total) * 100).toFixed(2) 
                            : 0
                    }));
                    resolve(trends);
                }
            });
        });
    }

    // Get top performing students
    getTopStudents(limit = 5) {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    u.id,
                    u.name,
                    AVG(g.score) as averageScore,
                    COUNT(g.id) as gradeCount
                FROM users u
                JOIN grades g ON u.id = g.studentId
                WHERE u.role = 'STUDENT'
                GROUP BY u.id
                ORDER BY averageScore DESC
                LIMIT ?
            `, [limit], (err, rows) => {
                if (err) reject(err);
                else {
                    const students = rows.map(row => ({
                        id: row.id,
                        name: row.name,
                        averageScore: parseFloat(row.averageScore).toFixed(2),
                        gradeCount: row.gradeCount
                    }));
                    resolve(students);
                }
            });
        });
    }

    // Get students needing attention (low grades or attendance)
    getStudentsNeedingAttention() {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    u.id,
                    u.name,
                    COALESCE(AVG(g.score), 0) as averageScore,
                    (SELECT COUNT(*) FROM attendance a WHERE a.studentId = u.id AND a.status = 'ABSENT') as absences
                FROM users u
                LEFT JOIN grades g ON u.id = g.studentId
                WHERE u.role = 'STUDENT'
                GROUP BY u.id
                HAVING averageScore < 60 OR absences >= 2
                ORDER BY averageScore ASC
            `, [], (err, rows) => {
                if (err) reject(err);
                else {
                    const students = rows.map(row => ({
                        id: row.id,
                        name: row.name,
                        averageScore: parseFloat(row.averageScore).toFixed(2),
                        absences: row.absences,
                        issues: []
                    }));

                    // Add issue flags
                    students.forEach(s => {
                        if (parseFloat(s.averageScore) < 60) s.issues.push('Low Grades');
                        if (s.absences >= 2) s.issues.push('High Absences');
                    });

                    resolve(students);
                }
            });
        });
    }
}

module.exports = new AnalyticsService();
