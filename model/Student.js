// File: model/Student.js
const User = require('./User');
const Role = require('./Role');

class Student extends User {
    constructor(id, name, email, password, parentId = null) {
        super(id, name, Role.STUDENT, email, password);
        this.parentId = parentId;
    }
}

module.exports = Student;
