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
        
        return savedGrade;
    }

    async getGradesByStudent(studentId) {
        return await GradeRepository.findByStudentId(studentId);
    }
}

module.exports = new GradeService();
