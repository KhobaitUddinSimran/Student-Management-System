// File: model/Grade.js
class Grade {
    constructor(id, studentId, subject, score, createdAt) {
        this.id = id;
        this.studentId = studentId;
        this.subject = subject;
        this.score = score;
        this.createdAt = createdAt || new Date().toISOString();
    }
}

module.exports = Grade;
