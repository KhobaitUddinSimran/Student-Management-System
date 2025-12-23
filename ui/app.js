// File: ui/app.js

const API_URL = '/api';

// DOM Elements
const userRoleSelect = document.getElementById('userRole');
const parentIdInput = document.getElementById('parentId');
const createUserForm = document.getElementById('createUserForm');
const studentList = document.getElementById('studentList');
const refreshStudentsBtn = document.getElementById('refreshStudents');
const addGradeForm = document.getElementById('addGradeForm');
const selectedStudentName = document.getElementById('selectedStudentName');
const gradeStudentId = document.getElementById('gradeStudentId');
const gradeList = document.getElementById('gradeList');

// --- Event Listeners ---

// Show Parent ID input only if Student role is selected
userRoleSelect.addEventListener('change', (e) => {
    if (e.target.value === 'STUDENT') {
        parentIdInput.style.display = 'block';
    } else {
        parentIdInput.style.display = 'none';
    }
});

// Create User
createUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const role = userRoleSelect.value;
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const pId = parentIdInput.value;

    const payload = { role, name, email };
    if (role === 'STUDENT' && pId) payload.parentId = pId;

    try {
        const res = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            alert('User created successfully!');
            createUserForm.reset();
            loadStudents(); // Refresh list if student was added
        } else {
            const err = await res.json();
            alert('Error: ' + err.error);
        }
    } catch (error) {
        console.error(error);
        alert('Failed to create user.');
    }
});

// Load Students
async function loadStudents() {
    studentList.innerHTML = 'Loading...';
    try {
        const res = await fetch(`${API_URL}/users?role=STUDENT`);
        const students = await res.json();
        
        studentList.innerHTML = '';
        students.forEach(student => {
            const li = document.createElement('li');
            li.textContent = `${student.name} (${student.email})`;
            li.onclick = () => selectStudent(student);
            studentList.appendChild(li);
        });
    } catch (error) {
        studentList.innerHTML = 'Error loading students.';
    }
}

refreshStudentsBtn.addEventListener('click', loadStudents);

// Select Student
function selectStudent(student) {
    // Highlight UI
    const items = studentList.querySelectorAll('li');
    items.forEach(i => i.classList.remove('active'));
    // (In a real app we'd match the element, here we just rely on click context or rebuild)
    
    selectedStudentName.textContent = `Selected: ${student.name}`;
    gradeStudentId.value = student.id;
    addGradeForm.style.display = 'flex';
    
    loadGrades(student.id);
}

// Load Grades
async function loadGrades(studentId) {
    gradeList.innerHTML = 'Loading...';
    try {
        const res = await fetch(`${API_URL}/grades/${studentId}`);
        const grades = await res.json();
        
        gradeList.innerHTML = '';
        if (grades.length === 0) {
            gradeList.innerHTML = '<li>No grades found.</li>';
            return;
        }

        grades.forEach(grade => {
            const li = document.createElement('li');
            li.className = 'grade-item';
            li.innerHTML = `
                <span>${grade.subject}</span>
                <span class="grade-score">${grade.score}</span>
            `;
            gradeList.appendChild(li);
        });
    } catch (error) {
        gradeList.innerHTML = 'Error loading grades.';
    }
}

// Add Grade
addGradeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const studentId = gradeStudentId.value;
    const subject = document.getElementById('gradeSubject').value;
    const score = document.getElementById('gradeScore').value;

    try {
        const res = await fetch(`${API_URL}/grades`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId, subject, score })
        });

        if (res.ok) {
            alert('Grade added! Notifications sent (check server console).');
            document.getElementById('gradeSubject').value = '';
            document.getElementById('gradeScore').value = '';
            loadGrades(studentId);
        } else {
            alert('Error adding grade.');
        }
    } catch (error) {
        console.error(error);
    }
});

// Initial Load
loadStudents();
