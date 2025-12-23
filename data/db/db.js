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
            message TEXT NOT NULL,
            createdAt TEXT,
            FOREIGN KEY(userId) REFERENCES users(id)
        )`);
    });
}

module.exports = db;
