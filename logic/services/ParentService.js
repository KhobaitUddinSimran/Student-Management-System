// File: logic/services/ParentService.js
const UserRepository = require('../../data/repositories/UserRepository');
const GradeRepository = require('../../data/repositories/GradeRepository');
const AttendanceRepository = require('../../data/repositories/AttendanceRepository');
const ClassRepository = require('../../data/repositories/ClassRepository');

class ParentService {
    // Verify parent has access to student
    async verifyAccess(parentId, studentId) {
        const isLinked = await UserRepository.isParentLinkedToStudent(parentId, studentId);
        if (!isLinked) {
            throw new Error('Access denied: You are not linked to this student');
        }
        return true;
    }

    // Get all data for parent's linked children
    async getChildrenData(parentId) {
        const children = await UserRepository.getLinkedStudents(parentId);
        
        const childrenData = [];
        for (const child of children) {
            const data = await this.getChildData(parentId, child.id);
            childrenData.push(data);
        }
        
        return childrenData;
    }

    // Get comprehensive data for a specific child
    async getChildData(parentId, studentId) {
        // Verify access first
        await this.verifyAccess(parentId, studentId);

        const student = await UserRepository.findById(studentId);
        const grades = await GradeRepository.getByStudentId(studentId);
        const attendanceData = await AttendanceRepository.getByStudent(studentId);
        const attendanceStats = await AttendanceRepository.getStudentStats(studentId);
        const classInfo = await ClassRepository.getClassByStudent(studentId);

        return {
            student: {
                id: student.id,
                name: student.name,
                email: student.email
            },
            class: classInfo,
            grades: grades,
            attendance: {
                records: attendanceData,
                stats: attendanceStats
            }
        };
    }

    // Get child's grades (with access check)
    async getChildGrades(parentId, studentId) {
        await this.verifyAccess(parentId, studentId);
        return await GradeRepository.getByStudentId(studentId);
    }

    // Get child's attendance (with access check)
    async getChildAttendance(parentId, studentId) {
        await this.verifyAccess(parentId, studentId);
        const attendance = await AttendanceRepository.getByStudent(studentId);
        const stats = await AttendanceRepository.getStudentStats(studentId);
        return { attendance, stats };
    }

    // Get child's class info (with access check)
    async getChildClass(parentId, studentId) {
        await this.verifyAccess(parentId, studentId);
        return await ClassRepository.getClassByStudent(studentId);
    }
}

module.exports = new ParentService();
