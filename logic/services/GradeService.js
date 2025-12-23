// File: logic/services/GradeService.js
const GradeRepository = require('../../data/repositories/GradeRepository');
const GradePublisher = require('../events/GradePublisher');
const { EmailNotificationObserver, ParentPortalObserver } = require('../events/GradeObserver');
const Grade = require('../../model/Grade');

class GradeService {
    constructor() {
        // Initialize Publisher and Observers
        this.publisher = new GradePublisher();
        this.publisher.addObserver(new EmailNotificationObserver());
        this.publisher.addObserver(new ParentPortalObserver());
    }

    async addGrade(studentId, subject, score) {
        const grade = new Grade(null, studentId, subject, score);
        
        // 1. Save to Database
        const savedGrade = await GradeRepository.create(grade);
        
        // 2. Notify Observers
        this.publisher.notifyObservers(savedGrade);

        // 3. Add letter grade info to response
        savedGrade.letterGrade = Grade.scoreToLetterGrade(score);
        savedGrade.gradePoints = Grade.scoreToGradePoints(score);
        
        return savedGrade;
    }

    async getGradesByStudent(studentId) {
        return await GradeRepository.findByStudentId(studentId);
    }

    // Get grades grouped by subject
    async getGradesBySubject(studentId) {
        return await GradeRepository.getByStudentGroupedBySubject(studentId);
    }

    // Calculate simple GPA (average of all grades)
    async calculateSimpleGPA(studentId) {
        return await GradeRepository.calculateSimpleGPA(studentId);
    }

    // Calculate weighted GPA (by subject)
    async calculateWeightedGPA(studentId) {
        return await GradeRepository.calculateWeightedGPA(studentId);
    }

    // Get comprehensive academic summary
    async getAcademicSummary(studentId) {
        return await GradeRepository.getAcademicSummary(studentId);
    }

    // Convert score to letter grade (utility)
    getLetterGrade(score) {
        return Grade.scoreToLetterGrade(score);
    }

    // Convert score to grade points (utility)
    getGradePoints(score) {
        return Grade.scoreToGradePoints(score);
    }
}

module.exports = new GradeService();
