// File: data/repositories/UserRepository.js
const db = require('../db/db');
const User = require('../../model/User');

class UserRepository {
    create(user) {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO users (name, role, email, password, parentId) VALUES (?, ?, ?, ?, ?)';
            const params = [user.name, user.role, user.email, user.password, user.parentId || null];
            
            db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    user.id = this.lastID;
                    resolve(user);
                }
            });
        });
    }

    findByEmail(email) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM users WHERE email = ?';
            db.get(sql, [email], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    findAllByRole(role) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM users WHERE role = ?';
            db.all(sql, [role], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    findById(id) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM users WHERE id = ?';
            db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }
    
    findAll() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM users';
            db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Get parent's linked student(s)
    getLinkedStudents(parentId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT id, name, email, role 
                FROM users 
                WHERE parentId = ? AND role = 'STUDENT'
            `;
            db.all(sql, [parentId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Get student's parent
    getParentByStudent(studentId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT p.id, p.name, p.email, p.role 
                FROM users s
                JOIN users p ON s.parentId = p.id
                WHERE s.id = ? AND s.role = 'STUDENT' AND p.role = 'PARENT'
            `;
            db.get(sql, [studentId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    // Link parent to student (update student's parentId)
    linkParentToStudent(parentId, studentId) {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE users SET parentId = ? WHERE id = ? AND role = ?';
            db.run(sql, [parentId, studentId, 'STUDENT'], function(err) {
                if (err) reject(err);
                else resolve({ updated: this.changes, parentId, studentId });
            });
        });
    }

    // Unlink parent from student
    unlinkParentFromStudent(studentId) {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE users SET parentId = NULL WHERE id = ? AND role = ?';
            db.run(sql, [studentId, 'STUDENT'], function(err) {
                if (err) reject(err);
                else resolve({ updated: this.changes });
            });
        });
    }

    // Check if parent is linked to a specific student
    isParentLinkedToStudent(parentId, studentId) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT id FROM users WHERE id = ? AND parentId = ? AND role = ?';
            db.get(sql, [studentId, parentId, 'STUDENT'], (err, row) => {
                if (err) reject(err);
                else resolve(!!row);
            });
        });
    }

    // Get students without a parent
    getUnlinkedStudents() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT id, name, email 
                FROM users 
                WHERE role = 'STUDENT' AND (parentId IS NULL OR parentId = '')
            `;
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

module.exports = new UserRepository();
