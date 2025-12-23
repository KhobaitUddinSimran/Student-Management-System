// File: model/Admin.js
const User = require('./User');
const Role = require('./Role');

class Admin extends User {
    constructor(id, name, email, password) {
        super(id, name, Role.ADMIN, email, password);
    }
}

module.exports = Admin;
