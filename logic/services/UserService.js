// File: logic/services/UserService.js
const UserRepository = require('../../data/repositories/UserRepository');
const UserFactory = require('../factory/UserFactory');

class UserService {
    async createUser(role, data) {
        // Use Factory to create the correct object type
        const user = UserFactory.createUser(role, data);
        // Save to DB via Repository
        return await UserRepository.create(user);
    }

    async authenticate(email, password) {
        const user = await UserRepository.findByEmail(email);
        if (user && user.password === password) {
            return user;
        }
        return null;
    }

    async getStudents() {
        return await UserRepository.findAllByRole('STUDENT');
    }
    
    async getAllUsers() {
        return await UserRepository.findAll();
    }

    // ========== PARENT-STUDENT LINKING ==========

    // Get children linked to a parent
    async getLinkedStudents(parentId) {
        return await UserRepository.getLinkedStudents(parentId);
    }

    // Get parent of a student
    async getParentByStudent(studentId) {
        return await UserRepository.getParentByStudent(studentId);
    }

    // Link a parent to a student
    async linkParentToStudent(parentId, studentId) {
        return await UserRepository.linkParentToStudent(parentId, studentId);
    }

    // Unlink parent from student
    async unlinkParentFromStudent(studentId) {
        return await UserRepository.unlinkParentFromStudent(studentId);
    }

    // Check if parent can access student data
    async canParentAccessStudent(parentId, studentId) {
        return await UserRepository.isParentLinkedToStudent(parentId, studentId);
    }

    // Get students without parents (for admin to link)
    async getUnlinkedStudents() {
        return await UserRepository.getUnlinkedStudents();
    }

    // Get user by ID
    async getUserById(userId) {
        return await UserRepository.findById(userId);
    }
}

module.exports = new UserService();
