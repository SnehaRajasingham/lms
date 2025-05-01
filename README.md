# 📚 Library Management System (LMS)

This is a full-stack **Library Management System** built with **Node.js**, **Express**, **MongoDB**, and a **React + TypeScript** frontend. It allows administrators to manage books and users, and students to borrow and return books. The system includes **authentication**, **role-based access control**, **fine calculation**, and comprehensive **software testing** using **Vitest**, **Jest**, and **Postman**.

---

## 🚀 Features

### 👨‍🏫 Admin
- Add, update, delete books
- View all available books
- Search/filter books by title or author

### 👩‍🎓 Student
- Register and login securely
- Borrow available books
- Return borrowed books
- View current and historical borrow records
- Get fined if books are returned late

### 🔐 Authentication & Security
- JWT-based authentication
- Role-based access (admin, student)
- Helmet security headers
- Server-side validation

---

## 🧪 Testing & Quality Assurance

This project was developed as part of a **Software Quality Management** coursework, with a strong emphasis on testing strategies:

### ✅ Frontend Tests
- **Unit Tests** with Vitest + React Testing Library
- **Integration Tests** for login/register, book CRUD
- **Error handling tests** for form validations and failed submissions
- **Coverage Report**: Achieves over 90% test coverage for main pages

### ✅ Backend Tests
- **Unit & Integration Tests** using Jest + Supertest
- Tested endpoints:
  - `/api/auth/register`
  - `/api/auth/login`
  - `/api/books`
  - `/api/borrow/:id`
- Edge cases, security headers, and error handling validated

### ✅ Tools Used
- 🧪 Jest
- 🧪 Vitest
- 🧪 Postman
- ✅ ESLint & Prettier
- ✅ Coverage reporting via V8 and Istanbul

---

## 🛠️ Tech Stack

| Layer       | Tech                                         |
|-------------|----------------------------------------------|
| Frontend    | React, TypeScript, Tailwind CSS              |
| Backend     | Node.js, Express.js                          |
| Database    | MongoDB (Mongoose)                           |
| Auth        | JWT, bcrypt                                  |
| Testing     | Vitest, React Testing Library, Jest, Postman |
| Dev Tools   | ESLint, Prettier, Dotenv                     |

---

## 🧰 Project Structure

```bash
├── lms-client             # React frontend
│   ├── src/pages          # Pages (Login, Register, Dashboard, etc.)
│   ├── src/components     # Reusable components
│   └── src/tests          # Frontend test cases
├── lms-server             # Express backend
│   ├── models             # Mongoose models
│   ├── routes             # Route controllers
│   ├── middleware         # Auth + RBAC
│   └── tests              # Jest tests for APIs
