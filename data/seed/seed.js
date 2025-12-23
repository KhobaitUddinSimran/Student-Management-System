// File: data/seed/seed.js
const db = require('../db/db');
const Role = require('../../model/Role');

const seedData = () => {
    console.log('Seeding database...');
    
    db.serialize(() => {
        // 1. Drop Tables (Reset Schema)
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
            message TEXT NOT NULL,
            createdAt TEXT,
            FOREIGN KEY(userId) REFERENCES users(id)
        )`);

        // 3. Insert Data

        // Insert Admin
        db.run(`INSERT INTO users (name, role, email, password) VALUES ('Principal Skinner', '${Role.ADMIN}', 'admin@school.com', 'admin123')`);

        // Insert Teacher
        db.run(`INSERT INTO users (name, role, email, password) VALUES ('Edna Krabappel', '${Role.TEACHER}', 'edna@school.com', 'teacher123')`);

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
            });
        });
    });
    
    // Give it a moment to finish async ops
    setTimeout(() => {
        console.log('Seeding complete.');
    }, 1000);
};

seedData();
