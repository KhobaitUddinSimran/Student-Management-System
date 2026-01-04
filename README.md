# Student Management System (SMS)

A comprehensive Student Management System prototype built with Node.js, Express, and SQLite.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

### Installation

1. Clone or download the project
2. Navigate to the project directory
3. Install dependencies:

Note: Run the following commands in th terminal

```bash
npm install
```

### Running the Application

**Step 1: Seed the Database**

First, populate the database with initial data:

```bash
npm run seed
```

**Step 2: Start the Server**

Then, start the application:

```bash
npm start
```

The server will start and you can access the application in your browser.

---

## System Overview

This Student Management System is designed to handle authentication, academic tracking, financial management, and communication for schools.

---

## Modules

### 1. User Management Module

**Description:** This module acts as the gatekeeper of the system. It handles authentication, authorization, and the creation of user profiles for the four main actors: Admin, Teacher, Student, and Parent.

**Key Use Case:** Manage Users & Roles (UC006)

**Actor:** Admin

**How it Works:**

- **Registration:** The Admin logs in and navigates to "User Management." They input user details (name, email, role).
- **Validation:** The system checks for duplicate IDs or emails.
- **Role Assignment:** The Admin assigns a specific role (e.g., Teacher, Student). This defines what the user can see on their dashboard (e.g., a Student cannot see the "Add User" button).
- **Linking:** If the user is a Parent, the system links them to their specific Student(s) so they can view their child's data.

---

### 2. Academic Module

**Description:** This is the core engine of the system, handling day-to-day school activities like class management, attendance tracking, and grading.

#### A. Sub-Module: Attendance

**Key Use Case:** Mark Attendance (UC0011)

**Actor:** Teacher

**How it Works:**

- **Selection:** The Teacher selects a specific class and date from their dashboard.
- **Input:** The system retrieves the list of students. The Teacher toggles status (Present, Absent, Late) for each student.
- **Processing:** When submitted, the system saves the record to the database.
- **Automation:** If a student is marked "Absent," the system automatically triggers an alert to the Notification Module to inform the parent.

#### B. Sub-Module: Grading & Assessments

**Key Use Case:** Manage Assessments & Grades (UC0012)

**Actor:** Teacher, Admin

**How it Works:**

- **Creation:** A Teacher creates an assessment (e.g., "Midterm Math Exam") in the system.
- **Data Entry:** The Teacher enters marks for each student.
- **Calculation:** The Logic Layer automatically calculates the final grade or GPA based on the weighted scores.
- **Approval:** The Admin reviews the grades. Once approved, they are "published" and become visible on the Student and Parent dashboards.

#### C. Sub-Module: Class Management

**Key Use Case:** Manage Classes & Subjects

**Actor:** Admin

**How it Works:** The Admin creates class groups (e.g., "Grade 10A") and assigns specific subjects and a "Homeroom Teacher" to that class. This ensures that when a teacher logs in, they only see the students relevant to them.

---

### 3. Financial Module

**Description:** This module manages the monetary aspects of the school, allowing parents to view outstanding balances and pay fees online.

**Key Use Case:** Pay Fees & View Balance (UC001)

**Actor:** Parent, Admin, Payment Gateway

**How it Works:**

- **Invoicing:** The Admin sets up fee structures (e.g., "Tuition Fee - January"). The system assigns these fees to student accounts.
- **Viewing:** A Parent logs in and sees a "Pending Fees" alert.
- **Payment:** The Parent selects "Pay Now." The system redirects them to an external Payment Gateway (e.g., Stripe/PayPal).
- **Verification:**
  - **Success:** The gateway returns a success token. The system updates the fee status to "Paid" and generates a digital receipt.
  - **Failure:** The system prompts the user to retry.

---

### 4. Reporting & Analytics Module

**Description:** This module aggregates data to provide insights. It generates formal documents (Report Cards) and visual dashboards (charts/graphs).

**Key Use Case:** Generate Reports (UC008) & View Dashboard (UC003)

**Actor:** Admin, Teacher

**How it Works:**

- **Data Retrieval:** When a user requests a report (e.g., "Attendance Report"), the system queries the Database for all relevant records (attendance, grades, fees).
- **Processing:** The Application Layer processes this raw data to calculate metrics (e.g., "Average Class Attendance is 94%").
- **Visualization:** The data is displayed as bar charts or pie charts on the dashboard.
- **Export:** Users can export these insights as PDF or Excel files for official use.

---

### 5. Notification Module

**Description:** A background service responsible for communication. It sends alerts to users via email or SMS.

**Key Use Case:** Send Announcements / Notifications

**How it Works:**

- **Triggered Events:** When specific actions occur (e.g., a student is marked absent, a fee payment succeeds, or a new grade is published), this module automatically creates a notification record.
- **Broadcasting:** The Admin can also manually send "Announcements" (e.g., "School closed due to weather") which are pushed to all user dashboards.

---

## Summary of System Interactions (Sequence of Events)

To help visualize how these modules work together, here is the flow for a typical "End of Term" scenario:

1. **Teacher** logs in and uses the Academic Module to input final exam marks.
2. **System** calculates the GPA and sends the data to the Admin for approval.
3. **Admin** approves the grades via the User Management/Admin Dashboard.
4. **Notification Module** sends an email to Parents: "Report Cards are available."
5. **Parent** logs in, checks the Financial Module to ensure no fees are overdue (blocking access), and then views the child's grades via the Reporting Module.

---

## Project Structure

```
├── server.js              # Main application entry point
├── package.json           # Project dependencies and scripts
├── data/
│   ├── db/                # Database configuration
│   ├── repositories/      # Data access layer
│   └── seed/              # Database seeding scripts
├── logic/
│   ├── events/            # Observer pattern implementation
│   ├── factory/           # Factory pattern for user creation
│   └── services/          # Business logic services
├── model/                 # Domain models
└── ui/                    # Frontend HTML/CSS files
```

---

## Technologies Used

- **Backend:** Node.js, Express.js
- **Database:** SQLite3
- **Frontend:** HTML, CSS, JavaScript

---
