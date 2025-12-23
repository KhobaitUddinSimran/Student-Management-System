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
}

module.exports = new UserRepository();
