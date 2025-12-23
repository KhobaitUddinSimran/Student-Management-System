// File: logic/factory/UserFactory.js
const Admin = require('../../model/Admin');
const Teacher = require('../../model/Teacher');
const Student = require('../../model/Student');
const Parent = require('../../model/Parent');
const Role = require('../../model/Role');

class UserFactory {
    static createUser(role, data) {
        switch (role) {
            case Role.ADMIN:
                return new Admin(null, data.name, data.email, data.password);
            case Role.TEACHER:
                return new Teacher(null, data.name, data.email, data.password);
            case Role.STUDENT:
                return new Student(null, data.name, data.email, data.password, data.parentId);
            case Role.PARENT:
                return new Parent(null, data.name, data.email, data.password);
            default:
                throw new Error(`Invalid role: ${role}`);
        }
    }
}

module.exports = UserFactory;
