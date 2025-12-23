// File: server.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const UserService = require('./logic/services/UserService');
const GradeService = require('./logic/services/GradeService');
const NotificationRepository = require('./data/repositories/NotificationRepository');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'ui')));

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

// Get Notifications
app.get('/api/notifications/:userId', async (req, res) => {
    try {
        const notifications = await NotificationRepository.findByUserId(req.params.userId);
        res.json(notifications);
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

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
