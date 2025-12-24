// File: server.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const UserService = require('./logic/services/UserService');
const GradeService = require('./logic/services/GradeService');
const AttendanceService = require('./logic/services/AttendanceService');
const ClassService = require('./logic/services/ClassService');
const ParentService = require('./logic/services/ParentService');
const AnalyticsService = require('./logic/services/AnalyticsService');
const NotificationService = require('./logic/services/NotificationService');
const NotificationRepository = require('./data/repositories/NotificationRepository');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'ui')));

// Root route - serve login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'ui', 'login-new.html'));
});

// --- API Endpoints ---

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserService.authenticate(email, password);
        if (user) {
            res.json(user);
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- NOTIFICATION ENDPOINTS ---

// Get all notifications for a user (with unread count)
app.get('/api/notifications/:userId', async (req, res) => {
    try {
        const data = await NotificationService.getNotificationsWithCount(req.params.userId);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get unread notifications only
app.get('/api/notifications/:userId/unread', async (req, res) => {
    try {
        const notifications = await NotificationService.getUnreadNotifications(req.params.userId);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get unread count (badge count)
app.get('/api/notifications/:userId/count', async (req, res) => {
    try {
        const count = await NotificationService.getUnreadCount(req.params.userId);
        res.json({ unreadCount: count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get notifications by type
app.get('/api/notifications/:userId/type/:type', async (req, res) => {
    try {
        const notifications = await NotificationService.getNotificationsByType(
            req.params.userId, 
            req.params.type.toUpperCase()
        );
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get notification summary
app.get('/api/notifications/:userId/summary', async (req, res) => {
    try {
        const summary = await NotificationService.getNotificationSummary(req.params.userId);
        res.json(summary);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send notification to a user
app.post('/api/notifications', async (req, res) => {
    try {
        const { userId, message, title, type } = req.body;
        const notification = await NotificationService.sendNotification(userId, message, title, type);
        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send announcement to all users (or specific role)
app.post('/api/notifications/announcement', async (req, res) => {
    try {
        const { message, title, role } = req.body;
        const result = await NotificationService.sendAnnouncement(message, title, role);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark notification as read
app.put('/api/notifications/:id/read', async (req, res) => {
    try {
        const result = await NotificationService.markAsRead(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark all notifications as read for a user
app.put('/api/notifications/:userId/read-all', async (req, res) => {
    try {
        const result = await NotificationService.markAllAsRead(req.params.userId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a notification
app.delete('/api/notifications/:id', async (req, res) => {
    try {
        const result = await NotificationService.deleteNotification(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Clear all notifications for a user
app.delete('/api/notifications/:userId/all', async (req, res) => {
    try {
        const result = await NotificationService.clearAllNotifications(req.params.userId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Users (filter by role optional)
app.get('/api/users', async (req, res) => {
    try {
        const role = req.query.role;
        let users;
        if (role) {
            users = await UserService.getStudents(); // Simplified for prototype to just support student filtering or all
            // If we wanted generic role filtering we'd add a method to repo, but requirements emphasize students
            if (role !== 'STUDENT') {
                 // Fallback to all if not student for this simple prototype or implement generic filter
                 users = await UserService.getAllUsers();
                 users = users.filter(u => u.role === role);
            }
        } else {
            users = await UserService.getAllUsers();
        }
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create User
app.post('/api/users', async (req, res) => {
    try {
        const { role, name, email, password, parentId } = req.body;
        const newUser = await UserService.createUser(role, { name, email, password, parentId });
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await UserService.getUserById(req.params.id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- PARENT-STUDENT LINKING ENDPOINTS ---

// Get students linked to a parent
app.get('/api/parents/:parentId/children', async (req, res) => {
    try {
        const children = await UserService.getLinkedStudents(req.params.parentId);
        res.json(children);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all data for parent's children (dashboard view)
app.get('/api/parents/:parentId/dashboard', async (req, res) => {
    try {
        const data = await ParentService.getChildrenData(req.params.parentId);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get specific child's data (with access check)
app.get('/api/parents/:parentId/children/:studentId', async (req, res) => {
    try {
        const data = await ParentService.getChildData(req.params.parentId, req.params.studentId);
        res.json(data);
    } catch (error) {
        if (error.message.includes('Access denied')) {
            res.status(403).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

// Get child's grades (with access check)
app.get('/api/parents/:parentId/children/:studentId/grades', async (req, res) => {
    try {
        const grades = await ParentService.getChildGrades(req.params.parentId, req.params.studentId);
        res.json(grades);
    } catch (error) {
        if (error.message.includes('Access denied')) {
            res.status(403).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

// Get child's attendance (with access check)
app.get('/api/parents/:parentId/children/:studentId/attendance', async (req, res) => {
    try {
        const attendance = await ParentService.getChildAttendance(req.params.parentId, req.params.studentId);
        res.json(attendance);
    } catch (error) {
        if (error.message.includes('Access denied')) {
            res.status(403).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

// Link parent to student (Admin action)
app.post('/api/parents/:parentId/link/:studentId', async (req, res) => {
    try {
        const result = await UserService.linkParentToStudent(req.params.parentId, req.params.studentId);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Unlink parent from student (Admin action)
app.delete('/api/students/:studentId/unlink-parent', async (req, res) => {
    try {
        const result = await UserService.unlinkParentFromStudent(req.params.studentId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get students without parents (for admin to link)
app.get('/api/students/unlinked', async (req, res) => {
    try {
        const students = await UserService.getUnlinkedStudents();
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get parent of a student
app.get('/api/students/:studentId/parent', async (req, res) => {
    try {
        const parent = await UserService.getParentByStudent(req.params.studentId);
        res.json(parent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Grades for a Student
app.get('/api/grades/:studentId', async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const grades = await GradeService.getGradesByStudent(studentId);
        res.json(grades);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add Grade
app.post('/api/grades', async (req, res) => {
    try {
        const { studentId, subject, score } = req.body;
        const newGrade = await GradeService.addGrade(studentId, subject, score);
        res.status(201).json(newGrade);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- GPA & GRADE CALCULATION ENDPOINTS ---

// Get grades grouped by subject for a student
app.get('/api/grades/:studentId/by-subject', async (req, res) => {
    try {
        const grades = await GradeService.getGradesBySubject(req.params.studentId);
        res.json(grades);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Calculate simple GPA for a student
app.get('/api/grades/:studentId/gpa', async (req, res) => {
    try {
        const gpa = await GradeService.calculateSimpleGPA(req.params.studentId);
        res.json(gpa);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Calculate weighted GPA for a student (by subject)
app.get('/api/grades/:studentId/gpa/weighted', async (req, res) => {
    try {
        const gpa = await GradeService.calculateWeightedGPA(req.params.studentId);
        res.json(gpa);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get comprehensive academic summary for a student
app.get('/api/grades/:studentId/summary', async (req, res) => {
    try {
        const summary = await GradeService.getAcademicSummary(req.params.studentId);
        res.json(summary);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Convert score to letter grade (utility endpoint)
app.get('/api/grades/convert/letter/:score', async (req, res) => {
    try {
        const score = parseFloat(req.params.score);
        const letterGrade = GradeService.getLetterGrade(score);
        const gradePoints = GradeService.getGradePoints(score);
        res.json({ score, letterGrade, gradePoints });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- ATTENDANCE ENDPOINTS ---

// Get all students for attendance marking
app.get('/api/attendance/students', async (req, res) => {
    try {
        const students = await AttendanceService.getStudentsForAttendance();
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark attendance (batch)
app.post('/api/attendance', async (req, res) => {
    try {
        const { date, attendance, teacherId } = req.body;
        const result = await AttendanceService.markAttendance(date, attendance, teacherId);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get attendance by date
app.get('/api/attendance/date/:date', async (req, res) => {
    try {
        const attendance = await AttendanceService.getAttendanceByDate(req.params.date);
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get attendance for a specific student
app.get('/api/attendance/student/:studentId', async (req, res) => {
    try {
        const data = await AttendanceService.getStudentAttendance(req.params.studentId);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- CLASS MANAGEMENT ENDPOINTS ---

// Get all classes (optionally filter by teacher)
app.get('/api/classes', async (req, res) => {
    try {
        const { teacherId } = req.query;
        let classes;
        if (teacherId) {
            classes = await ClassService.getTeacherClasses(teacherId);
        } else {
            classes = await ClassService.getAllClasses();
        }
        res.json(classes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new class
app.post('/api/classes', async (req, res) => {
    try {
        const result = await ClassService.createClass(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get class by ID
app.get('/api/classes/:id', async (req, res) => {
    try {
        const classData = await ClassService.getClassById(req.params.id);
        if (classData) {
            res.json(classData);
        } else {
            res.status(404).json({ error: 'Class not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get students in a class
app.get('/api/classes/:id/students', async (req, res) => {
    try {
        const students = await ClassService.getClassStudents(req.params.id);
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Enroll student in class
app.post('/api/classes/:id/enroll', async (req, res) => {
    try {
        const { studentId } = req.body;
        const result = await ClassService.enrollStudent(studentId, req.params.id);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove student from class
app.delete('/api/classes/:id/students/:studentId', async (req, res) => {
    try {
        const result = await ClassService.removeStudentFromClass(req.params.studentId, req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get subjects for a class
app.get('/api/classes/:id/subjects', async (req, res) => {
    try {
        const subjects = await ClassService.getClassSubjects(req.params.id);
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get student's class
app.get('/api/students/:studentId/class', async (req, res) => {
    try {
        const classData = await ClassService.getStudentClass(req.params.studentId);
        res.json(classData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- SUBJECT ENDPOINTS ---

// Get all subjects (optionally filter by teacher)
app.get('/api/subjects', async (req, res) => {
    try {
        const { teacherId } = req.query;
        let subjects;
        if (teacherId) {
            subjects = await ClassService.getTeacherSubjects(teacherId);
        } else {
            subjects = await ClassService.getAllSubjects();
        }
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new subject
app.post('/api/subjects', async (req, res) => {
    try {
        const result = await ClassService.createSubject(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Assign subject to class with teacher
app.post('/api/subjects/assign', async (req, res) => {
    try {
        const { classId, subjectId, teacherId } = req.body;
        const result = await ClassService.assignSubjectToClass(classId, subjectId, teacherId);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- ANALYTICS ENDPOINTS ---

// Get user counts by role
app.get('/api/analytics/user-counts', async (req, res) => {
    try {
        const stats = await AnalyticsService.getUserStats();
        res.json({
            students: stats.STUDENT || 0,
            teachers: stats.TEACHER || 0,
            parents: stats.PARENT || 0,
            admins: stats.ADMIN || 0,
            total: stats.total || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get today's attendance summary
app.get('/api/analytics/attendance/today', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const attendance = await AttendanceService.getAttendanceByDate(today);
        
        // Count present, absent, late
        let present = 0;
        let absent = 0;
        let late = 0;
        let excused = 0;
        
        attendance.forEach(record => {
            const status = record.status?.toUpperCase();
            if (status === 'PRESENT') present++;
            else if (status === 'ABSENT') absent++;
            else if (status === 'LATE') late++;
            else if (status === 'EXCUSED') excused++;
        });
        
        const total = attendance.length;
        const rate = total > 0 ? ((present + late) / total) * 100 : 0;
        
        res.json({
            date: today,
            present,
            absent,
            late,
            excused,
            total,
            rate: Math.round(rate * 100) / 100
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get grades distribution for dashboard
app.get('/api/analytics/grades/distribution', async (req, res) => {
    try {
        const distribution = await AnalyticsService.getOverallGradeDistribution();
        // Convert to array format for the dashboard
        const grades = ['A', 'B', 'C', 'D', 'F'];
        const result = grades.map(grade => ({
            grade,
            count: distribution.counts?.[grade] || 0
        }));
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get overall dashboard statistics
app.get('/api/analytics/dashboard', async (req, res) => {
    try {
        const stats = await AnalyticsService.getDashboardStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get class-specific analytics
app.get('/api/analytics/class/:classId', async (req, res) => {
    try {
        const analytics = await AnalyticsService.getClassAnalytics(req.params.classId);
        res.json(analytics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get teacher analytics
app.get('/api/analytics/teacher/:teacherId', async (req, res) => {
    try {
        const analytics = await AnalyticsService.getTeacherAnalytics(req.params.teacherId);
        res.json(analytics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get attendance trends (last N days)
app.get('/api/analytics/attendance-trends', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const trends = await AnalyticsService.getAttendanceTrends(days);
        res.json(trends);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get top performing students
app.get('/api/analytics/top-students', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const students = await AnalyticsService.getTopStudents(limit);
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get students needing attention (low grades or high absences)
app.get('/api/analytics/students-attention', async (req, res) => {
    try {
        const students = await AnalyticsService.getStudentsNeedingAttention();
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get grade distribution
app.get('/api/analytics/grade-distribution', async (req, res) => {
    try {
        const { classId } = req.query;
        let distribution;
        if (classId) {
            distribution = await AnalyticsService.getClassGradeDistribution(classId);
        } else {
            distribution = await AnalyticsService.getOverallGradeDistribution();
        }
        res.json(distribution);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
