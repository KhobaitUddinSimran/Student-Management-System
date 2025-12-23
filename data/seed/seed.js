// File: data/seed/seed.js
const db = require('../db/db');
const Role = require('../../model/Role');

const seedData = () => {
    console.log('Seeding database...');
    
    db.serialize(() => {
        // 1. Drop Tables (Reset Schema)
        db.run("DROP TABLE IF EXISTS student_classes");
        db.run("DROP TABLE IF EXISTS class_subjects");
        db.run("DROP TABLE IF EXISTS subjects");
        db.run("DROP TABLE IF EXISTS classes");
        db.run("DROP TABLE IF EXISTS attendance");
        db.run("DROP TABLE IF EXISTS grades");
        db.run("DROP TABLE IF EXISTS notifications");
        db.run("DROP TABLE IF EXISTS users");

        // 2. Create Tables
        db.run(`CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL DEFAULT '123456',
            parentId INTEGER
        )`);

        db.run(`CREATE TABLE grades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            studentId INTEGER NOT NULL,
            subject TEXT NOT NULL,
            score INTEGER NOT NULL,
            createdAt TEXT,
            FOREIGN KEY(studentId) REFERENCES users(id)
        )`);

        db.run(`CREATE TABLE notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            title TEXT,
            message TEXT NOT NULL,
            type TEXT DEFAULT 'GENERAL' CHECK(type IN ('ATTENDANCE', 'GRADE', 'ANNOUNCEMENT', 'SYSTEM', 'GENERAL')),
            isRead INTEGER DEFAULT 0,
            createdAt TEXT,
            FOREIGN KEY(userId) REFERENCES users(id)
        )`);

        db.run(`CREATE TABLE attendance (
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
        db.run(`CREATE TABLE classes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            gradeLevel TEXT NOT NULL,
            homeroomTeacherId INTEGER,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(homeroomTeacherId) REFERENCES users(id)
        )`);

        // Create Subjects Table
        db.run(`CREATE TABLE subjects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            code TEXT UNIQUE NOT NULL,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        )`);

        // Create Class-Subject-Teacher Assignments Table
        db.run(`CREATE TABLE class_subjects (
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
        db.run(`CREATE TABLE student_classes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            studentId INTEGER NOT NULL,
            classId INTEGER NOT NULL,
            enrolledAt TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(studentId) REFERENCES users(id),
            FOREIGN KEY(classId) REFERENCES classes(id),
            UNIQUE(studentId, classId)
        )`);

        // 3. Insert Data

        // Insert Admin
        db.run(`INSERT INTO users (name, role, email, password) VALUES ('Principal Skinner', '${Role.ADMIN}', 'admin@school.com', 'admin123')`);

        // Insert Teachers
        db.run(`INSERT INTO users (name, role, email, password) VALUES ('Edna Krabappel', '${Role.TEACHER}', 'edna@school.com', 'teacher123')`);
        db.run(`INSERT INTO users (name, role, email, password) VALUES ('Elizabeth Hoover', '${Role.TEACHER}', 'hoover@school.com', 'teacher123')`);

        // Insert Parent
        db.run(`INSERT INTO users (name, role, email, password) VALUES ('Homer Simpson', '${Role.PARENT}', 'homer@school.com', 'parent123')`, function(err) {
            if (err) return console.error(err);
            const parentId = this.lastID;

            // Insert Students linked to Parent
            db.run(`INSERT INTO users (name, role, email, password, parentId) VALUES ('Bart Simpson', '${Role.STUDENT}', 'bart@school.com', 'student123', ${parentId})`, function(err) {
                if (err) return console.error(err);
                const bartId = this.lastID;
                
                // Insert Grades for Bart
                db.run(`INSERT INTO grades (studentId, subject, score, createdAt) VALUES (${bartId}, 'Math', 55, '${new Date().toISOString()}')`);
                db.run(`INSERT INTO grades (studentId, subject, score, createdAt) VALUES (${bartId}, 'History', 70, '${new Date().toISOString()}')`);
            });

            db.run(`INSERT INTO users (name, role, email, password, parentId) VALUES ('Lisa Simpson', '${Role.STUDENT}', 'lisa@school.com', 'student123', ${parentId})`, function(err) {
                if (err) return console.error(err);
                const lisaId = this.lastID;
                
                // Insert Grades for Lisa
                db.run(`INSERT INTO grades (studentId, subject, score, createdAt) VALUES (${lisaId}, 'Math', 100, '${new Date().toISOString()}')`);
                db.run(`INSERT INTO grades (studentId, subject, score, createdAt) VALUES (${lisaId}, 'Science', 98, '${new Date().toISOString()}')`);

                // Insert Sample Attendance Data
                const today = new Date().toISOString().split('T')[0];
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                const teacherId = 2; // Edna Krabappel
                
                // Attendance for Bart (id: 5) and Lisa (id: 6)
                db.run(`INSERT INTO attendance (studentId, date, status, markedBy) VALUES (5, '${today}', 'PRESENT', ${teacherId})`);
                db.run(`INSERT INTO attendance (studentId, date, status, markedBy) VALUES (6, '${today}', 'PRESENT', ${teacherId})`);
                db.run(`INSERT INTO attendance (studentId, date, status, markedBy) VALUES (5, '${yesterday}', 'ABSENT', ${teacherId})`);
                db.run(`INSERT INTO attendance (studentId, date, status, markedBy) VALUES (6, '${yesterday}', 'PRESENT', ${teacherId})`);

                // Insert Classes
                db.run(`INSERT INTO classes (name, gradeLevel, homeroomTeacherId) VALUES ('Grade 4A', '4', 2)`); // Class ID: 1, Teacher: Edna
                db.run(`INSERT INTO classes (name, gradeLevel, homeroomTeacherId) VALUES ('Grade 2A', '2', 3)`); // Class ID: 2, Teacher: Hoover

                // Insert Subjects
                db.run(`INSERT INTO subjects (name, code) VALUES ('Mathematics', 'MATH101')`);  // ID: 1
                db.run(`INSERT INTO subjects (name, code) VALUES ('Science', 'SCI101')`);       // ID: 2
                db.run(`INSERT INTO subjects (name, code) VALUES ('History', 'HIST101')`);      // ID: 3
                db.run(`INSERT INTO subjects (name, code) VALUES ('English', 'ENG101')`);       // ID: 4

                // Assign subjects to classes with teachers
                db.run(`INSERT INTO class_subjects (classId, subjectId, teacherId) VALUES (1, 1, 2)`); // Math in Grade 4A by Edna
                db.run(`INSERT INTO class_subjects (classId, subjectId, teacherId) VALUES (1, 3, 2)`); // History in Grade 4A by Edna
                db.run(`INSERT INTO class_subjects (classId, subjectId, teacherId) VALUES (2, 1, 3)`); // Math in Grade 2A by Hoover
                db.run(`INSERT INTO class_subjects (classId, subjectId, teacherId) VALUES (2, 2, 3)`); // Science in Grade 2A by Hoover

                // Enroll students in classes
                db.run(`INSERT INTO student_classes (studentId, classId) VALUES (5, 1)`); // Bart in Grade 4A
                db.run(`INSERT INTO student_classes (studentId, classId) VALUES (6, 2)`); // Lisa in Grade 2A

                // Insert Sample Notifications
                const now = new Date().toISOString();
                
                // Notifications for Parent (Homer - id: 4)
                db.run(`INSERT INTO notifications (userId, title, message, type, isRead, createdAt) VALUES (4, 'Attendance Alert', 'Your child Bart Simpson was marked ABSENT on ${yesterday}.', 'ATTENDANCE', 0, '${now}')`);
                db.run(`INSERT INTO notifications (userId, title, message, type, isRead, createdAt) VALUES (4, 'New Grade Posted', 'Bart Simpson received a score of 55 in Math.', 'GRADE', 0, '${now}')`);
                db.run(`INSERT INTO notifications (userId, title, message, type, isRead, createdAt) VALUES (4, 'New Grade Posted', 'Lisa Simpson received a score of 100 in Math.', 'GRADE', 1, '${now}')`);
                db.run(`INSERT INTO notifications (userId, title, message, type, isRead, createdAt) VALUES (4, 'School Announcement', 'Parent-Teacher conference scheduled for next Friday.', 'ANNOUNCEMENT', 0, '${now}')`);

                // Notifications for Teacher (Edna - id: 2)
                db.run(`INSERT INTO notifications (userId, title, message, type, isRead, createdAt) VALUES (2, 'System Notice', 'Grade submission deadline is approaching.', 'SYSTEM', 0, '${now}')`);
                db.run(`INSERT INTO notifications (userId, title, message, type, isRead, createdAt) VALUES (2, 'Announcement', 'Staff meeting tomorrow at 3 PM.', 'ANNOUNCEMENT', 0, '${now}')`);

                // Notifications for Admin (Principal Skinner - id: 1)
                db.run(`INSERT INTO notifications (userId, title, message, type, isRead, createdAt) VALUES (1, 'System Alert', '3 students have low attendance this week.', 'SYSTEM', 0, '${now}')`);
                db.run(`INSERT INTO notifications (userId, title, message, type, isRead, createdAt) VALUES (1, 'Report Ready', 'Monthly attendance report is ready for review.', 'GENERAL', 1, '${now}')`);
            });
        });
    });
    
    // Give it a moment to finish async ops
    setTimeout(() => {
        console.log('Seeding complete.');
    }, 1000);
};

seedData();
