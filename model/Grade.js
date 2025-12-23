// File: model/Grade.js
class Grade {
    constructor(id, studentId, subject, score, createdAt, weight = 1.0, assessmentType = 'GENERAL') {
        this.id = id;
        this.studentId = studentId;
        this.subject = subject;
        this.score = score;
        this.weight = weight; // Weight for GPA calculation (e.g., final exam = 0.4, midterm = 0.3)
        this.assessmentType = assessmentType; // QUIZ, MIDTERM, FINAL, ASSIGNMENT, PROJECT, GENERAL
        this.createdAt = createdAt || new Date().toISOString();
    }

    // Get letter grade based on score
    getLetterGrade() {
        return Grade.scoreToLetterGrade(this.score);
    }

    // Get grade points (4.0 scale)
    getGradePoints() {
        return Grade.scoreToGradePoints(this.score);
    }

    // Static method: Convert score to letter grade
    static scoreToLetterGrade(score) {
        if (score >= 93) return 'A';
        if (score >= 90) return 'A-';
        if (score >= 87) return 'B+';
        if (score >= 83) return 'B';
        if (score >= 80) return 'B-';
        if (score >= 77) return 'C+';
        if (score >= 73) return 'C';
        if (score >= 70) return 'C-';
        if (score >= 67) return 'D+';
        if (score >= 63) return 'D';
        if (score >= 60) return 'D-';
        return 'F';
    }

    // Static method: Convert score to grade points (4.0 scale)
    static scoreToGradePoints(score) {
        if (score >= 93) return 4.0;
        if (score >= 90) return 3.7;
        if (score >= 87) return 3.3;
        if (score >= 83) return 3.0;
        if (score >= 80) return 2.7;
        if (score >= 77) return 2.3;
        if (score >= 73) return 2.0;
        if (score >= 70) return 1.7;
        if (score >= 67) return 1.3;
        if (score >= 63) return 1.0;
        if (score >= 60) return 0.7;
        return 0.0;
    }

    // Static method: Convert GPA to letter grade
    static gpaToLetterGrade(gpa) {
        if (gpa >= 3.7) return 'A';
        if (gpa >= 3.3) return 'A-';
        if (gpa >= 3.0) return 'B+';
        if (gpa >= 2.7) return 'B';
        if (gpa >= 2.3) return 'B-';
        if (gpa >= 2.0) return 'C+';
        if (gpa >= 1.7) return 'C';
        if (gpa >= 1.3) return 'C-';
        if (gpa >= 1.0) return 'D+';
        if (gpa >= 0.7) return 'D';
        return 'F';
    }
}

module.exports = Grade;
