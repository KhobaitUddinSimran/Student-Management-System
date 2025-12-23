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
}

module.exports = new UserService();
