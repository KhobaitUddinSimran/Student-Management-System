// File: model/Parent.js
const User = require('./User');
const Role = require('./Role');

class Parent extends User {
    constructor(id, name, email, password) {
        super(id, name, Role.PARENT, email, password);
    }
}

module.exports = Parent;
