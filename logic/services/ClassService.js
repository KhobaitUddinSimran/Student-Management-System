// File: logic/services/ClassService.js
const ClassRepository = require('../../data/repositories/ClassRepository');
const SubjectRepository = require('../../data/repositories/SubjectRepository');

class ClassService {
    // ========== CLASS MANAGEMENT ==========

    // Create a new class
    async createClass(classData) {
        return await ClassRepository.create(classData);
    }

    // Get all classes
    async getAllClasses() {
        return await ClassRepository.findAll();
    }

    // Get class by ID
    async getClassById(id) {
        return await ClassRepository.findById(id);
    }

    // Get classes for a teacher
    async getTeacherClasses(teacherId) {
        return await ClassRepository.findByTeacher(teacherId);
    }

    // ========== STUDENT ENROLLMENT ==========

    // Enroll student in class
    async enrollStudent(studentId, classId) {
        return await ClassRepository.enrollStudent(studentId, classId);
    }

    // Get students in a class
    async getClassStudents(classId) {
        return await ClassRepository.getStudentsByClass(classId);
    }

    // Get student's class
    async getStudentClass(studentId) {
        return await ClassRepository.getClassByStudent(studentId);
    }

    // Remove student from class
    async removeStudentFromClass(studentId, classId) {
        return await ClassRepository.removeStudent(studentId, classId);
    }

    // ========== SUBJECT MANAGEMENT ==========

    // Create a subject
    async createSubject(subjectData) {
        return await SubjectRepository.create(subjectData);
    }

    // Get all subjects
    async getAllSubjects() {
        return await SubjectRepository.findAll();
    }

    // Assign subject to class with teacher
    async assignSubjectToClass(classId, subjectId, teacherId) {
        return await SubjectRepository.assignToClass(classId, subjectId, teacherId);
    }

    // Get subjects for a class
    async getClassSubjects(classId) {
        return await SubjectRepository.getByClass(classId);
    }

    // Get subjects taught by a teacher
    async getTeacherSubjects(teacherId) {
        return await SubjectRepository.getByTeacher(teacherId);
    }

    // Remove subject from class
    async removeSubjectFromClass(classId, subjectId) {
        return await SubjectRepository.removeFromClass(classId, subjectId);
    }
}

module.exports = new ClassService();
