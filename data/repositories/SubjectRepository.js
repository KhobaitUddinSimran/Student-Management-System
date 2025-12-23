// File: data/repositories/SubjectRepository.js
const db = require('../db/db');

class SubjectRepository {
    // Create a new subject
    create(subjectData) {
        return new Promise((resolve, reject) => {
            const { name, code } = subjectData;
            db.run(
                'INSERT INTO subjects (name, code) VALUES (?, ?)',
                [name, code],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, ...subjectData });
                }
            );
        });
    }

    // Get all subjects
    findAll() {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM subjects ORDER BY name', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Get subject by ID
    findById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM subjects WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    // Assign subject to class with teacher
    assignToClass(classId, subjectId, teacherId) {
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT OR REPLACE INTO class_subjects (classId, subjectId, teacherId) VALUES (?, ?, ?)',
                [classId, subjectId, teacherId],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, classId, subjectId, teacherId });
                }
            );
        });
    }

    // Get subjects by class (with teacher info)
    getByClass(classId) {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT s.*, cs.teacherId, u.name as teacherName 
                FROM subjects s
                JOIN class_subjects cs ON s.id = cs.subjectId
                JOIN users u ON cs.teacherId = u.id
                WHERE cs.classId = ?
                ORDER BY s.name
            `, [classId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Get subjects taught by teacher (with class info)
    getByTeacher(teacherId) {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT s.*, c.name as className, c.id as classId, c.gradeLevel
                FROM subjects s
                JOIN class_subjects cs ON s.id = cs.subjectId
                JOIN classes c ON cs.classId = c.id
                WHERE cs.teacherId = ?
                ORDER BY c.gradeLevel, c.name, s.name
            `, [teacherId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Remove subject from class
    removeFromClass(classId, subjectId) {
        return new Promise((resolve, reject) => {
            db.run(
                'DELETE FROM class_subjects WHERE classId = ? AND subjectId = ?',
                [classId, subjectId],
                function(err) {
                    if (err) reject(err);
                    else resolve({ removed: this.changes });
                }
            );
        });
    }
}

module.exports = new SubjectRepository();
