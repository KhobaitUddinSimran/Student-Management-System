// File: model/Teacher.js
const User = require('./User');
const Role = require('./Role');

class Teacher extends User {
    constructor(id, name, email, password) {
        super(id, name, Role.TEACHER, email, password);
    }
}

module.exports = Teacher;
