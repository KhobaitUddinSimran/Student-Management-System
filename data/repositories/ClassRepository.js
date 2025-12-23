// File: data/repositories/ClassRepository.js
const db = require('../db/db');

class ClassRepository {
    // Create a new class
    create(classData) {
        return new Promise((resolve, reject) => {
            const { name, gradeLevel, homeroomTeacherId } = classData;
            db.run(
                'INSERT INTO classes (name, gradeLevel, homeroomTeacherId) VALUES (?, ?, ?)',
                [name, gradeLevel, homeroomTeacherId || null],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, ...classData });
                }
            );
        });
    }

    // Get all classes
    findAll() {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT c.*, u.name as teacherName 
                FROM classes c 
                LEFT JOIN users u ON c.homeroomTeacherId = u.id
                ORDER BY c.gradeLevel, c.name
            `, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Get class by ID
    findById(id) {
        return new Promise((resolve, reject) => {
            db.get(`
                SELECT c.*, u.name as teacherName 
                FROM classes c 
                LEFT JOIN users u ON c.homeroomTeacherId = u.id
                WHERE c.id = ?
            `, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    // Get classes by teacher (homeroom or assigned subjects)
    findByTeacher(teacherId) {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT DISTINCT c.*, u.name as teacherName 
                FROM classes c
                LEFT JOIN users u ON c.homeroomTeacherId = u.id
                LEFT JOIN class_subjects cs ON c.id = cs.classId
                WHERE c.homeroomTeacherId = ? OR cs.teacherId = ?
                ORDER BY c.gradeLevel, c.name
            `, [teacherId, teacherId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Enroll student in class
    enrollStudent(studentId, classId) {
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT OR IGNORE INTO student_classes (studentId, classId) VALUES (?, ?)',
                [studentId, classId],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, studentId, classId });
                }
            );
        });
    }

    // Get students in a class
    getStudentsByClass(classId) {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT u.id, u.name, u.email 
                FROM users u
                JOIN student_classes sc ON u.id = sc.studentId
                WHERE sc.classId = ? AND u.role = 'STUDENT'
                ORDER BY u.name
            `, [classId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Get class by student
    getClassByStudent(studentId) {
        return new Promise((resolve, reject) => {
            db.get(`
                SELECT c.*, u.name as teacherName
                FROM classes c
                JOIN student_classes sc ON c.id = sc.classId
                LEFT JOIN users u ON c.homeroomTeacherId = u.id
                WHERE sc.studentId = ?
            `, [studentId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    // Remove student from class
    removeStudent(studentId, classId) {
        return new Promise((resolve, reject) => {
            db.run(
                'DELETE FROM student_classes WHERE studentId = ? AND classId = ?',
                [studentId, classId],
                function(err) {
                    if (err) reject(err);
                    else resolve({ removed: this.changes });
                }
            );
        });
    }
}

module.exports = new ClassRepository();
