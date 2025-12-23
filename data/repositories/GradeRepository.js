// File: data/repositories/GradeRepository.js
const db = require('../db/db');
const Grade = require('../../model/Grade');

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
                    // Add letter grade and grade points to each row
                    const enrichedRows = rows.map(row => ({
                        ...row,
                        letterGrade: Grade.scoreToLetterGrade(row.score),
                        gradePoints: Grade.scoreToGradePoints(row.score)
                    }));
                    resolve(enrichedRows);
                }
            });
        });
    }

    // Alias for consistency
    getByStudentId(studentId) {
        return this.findByStudentId(studentId);
    }

    // Get grades grouped by subject for a student
    getByStudentGroupedBySubject(studentId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT subject, 
                       AVG(score) as averageScore,
                       COUNT(*) as assessmentCount,
                       MIN(score) as lowestScore,
                       MAX(score) as highestScore
                FROM grades 
                WHERE studentId = ?
                GROUP BY subject
                ORDER BY subject
            `;
            db.all(sql, [studentId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const enrichedRows = rows.map(row => ({
                        ...row,
                        averageScore: parseFloat(row.averageScore.toFixed(2)),
                        letterGrade: Grade.scoreToLetterGrade(row.averageScore),
                        gradePoints: Grade.scoreToGradePoints(row.averageScore)
                    }));
                    resolve(enrichedRows);
                }
            });
        });
    }

    // Calculate GPA for a student (simple average)
    calculateSimpleGPA(studentId) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT AVG(score) as averageScore FROM grades WHERE studentId = ?';
            db.get(sql, [studentId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (!row || row.averageScore === null) {
                        resolve({
                            gpa: 0,
                            letterGrade: 'N/A',
                            averageScore: 0,
                            totalAssessments: 0
                        });
                    } else {
                        const avgScore = row.averageScore;
                        const gpa = Grade.scoreToGradePoints(avgScore);
                        resolve({
                            gpa: parseFloat(gpa.toFixed(2)),
                            letterGrade: Grade.gpaToLetterGrade(gpa),
                            averageScore: parseFloat(avgScore.toFixed(2)),
                            totalAssessments: 0 // Will be filled separately
                        });
                    }
                }
            });
        });
    }

    // Calculate weighted GPA by subject (each subject weighted equally)
    calculateWeightedGPA(studentId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT subject, AVG(score) as subjectAverage
                FROM grades 
                WHERE studentId = ?
                GROUP BY subject
            `;
            db.all(sql, [studentId], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (!rows || rows.length === 0) {
                    resolve({
                        gpa: 0,
                        letterGrade: 'N/A',
                        subjectCount: 0,
                        subjects: []
                    });
                    return;
                }

                // Calculate GPA for each subject
                const subjectGPAs = rows.map(row => ({
                    subject: row.subject,
                    averageScore: parseFloat(row.subjectAverage.toFixed(2)),
                    gradePoints: Grade.scoreToGradePoints(row.subjectAverage),
                    letterGrade: Grade.scoreToLetterGrade(row.subjectAverage)
                }));

                // Calculate overall GPA (average of subject GPAs)
                const totalGradePoints = subjectGPAs.reduce((sum, s) => sum + s.gradePoints, 0);
                const overallGPA = totalGradePoints / subjectGPAs.length;

                resolve({
                    gpa: parseFloat(overallGPA.toFixed(2)),
                    letterGrade: Grade.gpaToLetterGrade(overallGPA),
                    subjectCount: subjectGPAs.length,
                    subjects: subjectGPAs
                });
            });
        });
    }

    // Get student's academic summary
    getAcademicSummary(studentId) {
        return new Promise(async (resolve, reject) => {
            try {
                const grades = await this.findByStudentId(studentId);
                const subjectGrades = await this.getByStudentGroupedBySubject(studentId);
                const gpaData = await this.calculateWeightedGPA(studentId);

                resolve({
                    studentId: studentId,
                    gpa: gpaData.gpa,
                    letterGrade: gpaData.letterGrade,
                    totalAssessments: grades.length,
                    subjectCount: subjectGrades.length,
                    subjects: subjectGrades,
                    recentGrades: grades.slice(0, 5) // Last 5 grades
                });
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new GradeRepository();
