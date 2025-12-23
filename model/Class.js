// File: model/Class.js
class Class {
    constructor(id, name, gradeLevel, homeroomTeacherId, createdAt = null) {
        this.id = id;
        this.name = name;
        this.gradeLevel = gradeLevel;
        this.homeroomTeacherId = homeroomTeacherId;
        this.createdAt = createdAt || new Date().toISOString();
    }
}

module.exports = Class;
