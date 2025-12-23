// File: model/User.js
class User {
    constructor(id, name, role, email, password) {
        this.id = id;
        this.name = name;
        this.role = role;
        this.email = email;
        this.password = password;
    }

    getDetails() {
        return `${this.role}: ${this.name} (${this.email})`;
    }
}

module.exports = User;
