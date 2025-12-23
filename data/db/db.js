// File: data/db/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'school.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Create Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL DEFAULT '123456',
            parentId INTEGER
        )`);

        // Create Grades Table
        db.run(`CREATE TABLE IF NOT EXISTS grades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            studentId INTEGER NOT NULL,
            subject TEXT NOT NULL,
            score INTEGER NOT NULL,
            createdAt TEXT,
            FOREIGN KEY(studentId) REFERENCES users(id)
        )`);

        // Create Notifications Table
        db.run(`CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            title TEXT,
            message TEXT NOT NULL,
            type TEXT DEFAULT 'GENERAL' CHECK(type IN ('ATTENDANCE', 'GRADE', 'ANNOUNCEMENT', 'SYSTEM', 'GENERAL')),
            isRead INTEGER DEFAULT 0,
            createdAt TEXT,
            FOREIGN KEY(userId) REFERENCES users(id)
        )`);

        // Create Attendance Table
        db.run(`CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            studentId INTEGER NOT NULL,
            date TEXT NOT NULL,
            status TEXT NOT NULL CHECK(status IN ('PRESENT', 'ABSENT', 'LATE')),
            markedBy INTEGER NOT NULL,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(studentId) REFERENCES users(id),
            FOREIGN KEY(markedBy) REFERENCES users(id),
            UNIQUE(studentId, date)
        )`);

        // Create Classes Table
        db.run(`CREATE TABLE IF NOT EXISTS classes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            gradeLevel TEXT NOT NULL,
            homeroomTeacherId INTEGER,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(homeroomTeacherId) REFERENCES users(id)
        )`);

        // Create Subjects Table
        db.run(`CREATE TABLE IF NOT EXISTS subjects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            code TEXT UNIQUE NOT NULL,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        )`);

        // Create Class-Subject-Teacher Assignments Table
        db.run(`CREATE TABLE IF NOT EXISTS class_subjects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            classId INTEGER NOT NULL,
            subjectId INTEGER NOT NULL,
            teacherId INTEGER NOT NULL,
            FOREIGN KEY(classId) REFERENCES classes(id),
            FOREIGN KEY(subjectId) REFERENCES subjects(id),
            FOREIGN KEY(teacherId) REFERENCES users(id),
            UNIQUE(classId, subjectId)
        )`);

        // Create Student-Class Enrollment Table
        db.run(`CREATE TABLE IF NOT EXISTS student_classes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            studentId INTEGER NOT NULL,
            classId INTEGER NOT NULL,
            enrolledAt TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(studentId) REFERENCES users(id),
            FOREIGN KEY(classId) REFERENCES classes(id),
            UNIQUE(studentId, classId)
        )`);
    });
}

module.exports = db;
