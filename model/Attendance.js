// File: model/Attendance.js
class Attendance {
    constructor(id, studentId, date, status, markedBy, createdAt = null) {
        this.id = id;
        this.studentId = studentId;
        this.date = date;
        this.status = status; // PRESENT, ABSENT, LATE
        this.markedBy = markedBy;
        this.createdAt = createdAt || new Date().toISOString();
    }
}

module.exports = Attendance;
