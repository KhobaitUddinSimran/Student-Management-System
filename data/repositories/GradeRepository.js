// File: data/repositories/GradeRepository.js
const db = require('../db/db');

class GradeRepository {
    create(grade) {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO grades (studentId, subject, score, createdAt) VALUES (?, ?, ?, ?)';
            const params = [grade.studentId, grade.subject, grade.score, grade.createdAt];
            
            db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    grade.id = this.lastID;
                    resolve(grade);
                }
            });
        });
    }

    findByStudentId(studentId) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM grades WHERE studentId = ? ORDER BY createdAt DESC';
            db.all(sql, [studentId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
}

module.exports = new GradeRepository();
