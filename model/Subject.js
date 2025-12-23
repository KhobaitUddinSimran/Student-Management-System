// File: model/Subject.js
class Subject {
    constructor(id, name, code, createdAt = null) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.createdAt = createdAt || new Date().toISOString();
    }
}

module.exports = Subject;
