# Smart Campus Operations Hub - Facilities Management System

## Project Overview

This is a comprehensive web application for managing facilities and assets at a university campus. It includes both a Spring Boot REST API backend and a React frontend, focusing on the Facilities Management module.

### Current Implementation: User 1 - Facilities Management

- **Facilities Catalogue**: Browse and search for available facilities
- **Facility Management**: Create, update, delete facilities (Admin only)
- **Authentication**: User registration and login with JWT tokens
- **Real-time Search**: Search facilities by name, location, and building

---

## Project Structure

```
Smart-Campus-Operations-Hub/
├── backend/                          # Spring Boot REST API
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/smartcampus/backend/
│   │   │   │   ├── SmartCampusBackendApplication.java
│   │   │   │   ├── entity/               # JPA Entities
│   │   │   │   │   ├── User.java
│   │   │   │   │   └── Facility.java
│   │   │   │   ├── dto/                  # Data Transfer Objects
│   │   │   │   │   ├── LoginRequest.java
│   │   │   │   │   ├── SignupRequest.java
│   │   │   │   │   ├── AuthResponse.java
│   │   │   │   │   └── FacilityDTO.java
│   │   │   │   ├── repository/           # Spring Data JPA Repositories
│   │   │   │   │   ├── UserRepository.java
│   │   │   │   │   └── FacilityRepository.java
│   │   │   │   ├── service/              # Business Logic
│   │   │   │   │   ├── AuthService.java
│   │   │   │   │   ├── FacilityService.java
│   │   │   │   │   └── CustomUserDetailsService.java
│   │   │   │   ├── controller/           # REST Endpoints
│   │   │   │   │   ├── AuthController.java
│   │   │   │   │   └── FacilityController.java
│   │   │   │   ├── security/             # JWT & Security
│   │   │   │   │   ├── JwtTokenProvider.java
│   │   │   │   │   └── JwtAuthenticationFilter.java
│   │   │   │   ├── config/               # Configuration Classes
│   │   │   │   │   └── SecurityConfig.java
│   │   │   │   └── exception/            # Exception Handling
│   │   │   │       ├── ResourceNotFoundException.java
│   │   │   │       ├── BadRequestException.java
│   │   │   │       ├── ErrorResponse.java
│   │   │   │       └── GlobalExceptionHandler.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/                     # (For future unit tests)
│   └── pom.xml
│
├── frontend/                         # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── PrivateRoute.jsx      # Protected Route Component
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx         # Login Interface
│   │   │   ├── SignupPage.jsx        # Registration Interface
│   │   │   └── DashboardPage.jsx     # Facilities Dashboard
│   │   ├── services/
│   │   │   └── apiService.js         # API Requests & Interceptors
│   │   ├── store/
│   │   │   └── authStore.js          # Zustand Auth State
│   │   ├── styles/
│   │   │   ├── auth.css              # Auth Pages Styling
│   │   │   └── dashboard.css         # Dashboard Styling
│   │   ├── App.jsx                   # Main App Component
│   │   ├── App.css                   # App Styling
│   │   └── main.jsx                  # Entry Point
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## Installation & Setup

### 1. Backend Setup (Spring Boot)

#### Prerequisites
- Java 17 or higher
- Maven 3.6 or higher
- MySQL 8.0 or higher

#### Steps

1. **Create Database**
   ```sql
   CREATE DATABASE smart_campus_db;
   ```

2. **Configure Database Connection**
   Edit `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/smart_campus_db
   spring.datasource.username=root
   spring.datasource.password=your_password
   ```

3. **Build and Run**
   ```bash
   cd backend
   mvn clean install
   mvn spring-boot:run
   ```

   The backend will start at `http://localhost:8080/api`

### 2. Frontend Setup (React)

#### Prerequisites
- Node.js 16 or higher
- npm or yarn

#### Steps

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

   The frontend will run at `http://localhost:3000`

---

## API Documentation

### Authentication Endpoints

#### Sign Up
- **URL**: `POST /api/auth/signup`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "fullName": "John Doe",
    "studentId": "ST12345",
    "phoneNumber": "+1 (555) 000-0000",
    "department": "Engineering"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "type": "Bearer",
    "userId": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "USER",
    "message": "User registered successfully"
  }
  ```

#### Login
- **URL**: `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "type": "Bearer",
    "userId": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "USER",
    "message": "Login successful"
  }
  ```

### Facilities Endpoints

#### Get All Facilities
- **URL**: `GET /api/facilities`
- **Authentication**: Required (Bearer Token)
- **Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "name": "Lecture Hall A",
      "type": "LECTURE_HALL",
      "capacity": 100,
      "location": "Building A, Wing 1",
      "building": "Building A",
      "floor": "1",
      "status": "ACTIVE",
      "description": "Large lecture hall with projector",
      "equipment": "Projector, Screen, Microphone"
    }
  ]
  ```

#### Search Facilities
- **URL**: `GET /api/facilities/search?keyword=lab`
- **Authentication**: Not Required (Public)
- **Response**: `200 OK` (Array of matching facilities)

#### Get Facilities by Type
- **URL**: `GET /api/facilities/type/LECTURE_HALL`
- **Authentication**: Required
- **Types**: `LECTURE_HALL`, `LAB`, `MEETING_ROOM`, `AUDITORIUM`, `EQUIPMENT`

#### Get Facilities by Status
- **URL**: `GET /api/facilities/status/ACTIVE`
- **Authentication**: Required
- **Statuses**: `ACTIVE`, `OUT_OF_SERVICE`, `MAINTENANCE`, `INACTIVE`

#### Get Facilities by Capacity
- **URL**: `GET /api/facilities/capacity/50`
- **Authentication**: Required
- **Returns**: Facilities with capacity >= specified number

#### Create Facility (Admin Only)
- **URL**: `POST /api/facilities`
- **Authentication**: Required (Admin role)
- **Request Body**:
  ```json
  {
    "name": "New Lab",
    "description": "Computer lab",
    "type": "LAB",
    "capacity": 30,
    "location": "Building B",
    "building": "Building B",
    "floor": "2",
    "status": "ACTIVE",
    "equipment": "30 Computers, Projector"
  }
  ```
- **Response**: `201 Created`

#### Update Facility (Admin Only)
- **URL**: `PUT /api/facilities/{id}`
- **Authentication**: Required (Admin role)
- **Request Body**: (Same as Create, fields are optional)
- **Response**: `200 OK`

#### Delete Facility (Admin Only)
- **URL**: `DELETE /api/facilities/{id}`
- **Authentication**: Required (Admin role)
- **Response**: `204 No Content`

---

## Features Implemented

### ✅ Authentication
- [x] User Registration with Email Validation
- [x] Login with Email and Password
- [x] JWT Token Generation and Validation
- [x] Password Encryption (BCrypt)
- [x] Role-Based Access Control (USER, ADMIN, TECHNICIAN, MANAGER)
- [x] Persistent Authentication (Token stored in localStorage)
- [x] Logout Functionality

### ✅ Facilities Management
- [x] View All Facilities Catalogue
- [x] Search Facilities by Keyword
- [x] Filter Facilities by Type
- [x] Filter Facilities by Status
- [x] Filter Facilities by Capacity
- [x] Create Facilities (Admin)
- [x] Update Facilities (Admin)
- [x] Delete Facilities (Admin)
- [x] Responsive Design

### ✅ UI/UX
- [x] Professional Login & Signup Forms
- [x] Dashboard with Facility Cards
- [x] Real-time Search
- [x] Status Indicators with Color Coding
- [x] Error Handling & User Feedback
- [x] Loading States
- [x] Mobile Responsive Design
- [x] Clean Navigation

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  phone_number VARCHAR(20),
  department VARCHAR(100),
  role VARCHAR(50) DEFAULT 'USER',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Facilities Table
```sql
CREATE TABLE facilities (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  capacity INT NOT NULL,
  location VARCHAR(255) NOT NULL,
  building VARCHAR(100),
  floor VARCHAR(10),
  status VARCHAR(50) DEFAULT 'ACTIVE',
  equipment TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## Testing API with Postman

1. **Import Collection** (Optional)
   - Create a new Postman Collection
   - Add requests for each endpoint

2. **Sign Up**
   - POST to `http://localhost:8080/api/auth/signup`
   - Include all required fields

3. **Login**
   - POST to `http://localhost:8080/api/auth/login`
   - Copy the token from response

4. **Authorize Requests**
   - Add Authorization header: `Bearer <token>`
   - Or use Postman's Bearer Token auth

5. **Test Facilities Endpoints**
   - GET, POST, PUT, DELETE operations

---

## Future Enhancements

- [ ] Module B: Booking Management System
- [ ] Module C: Maintenance & Incident Ticketing
- [ ] Module D: Notifications
- [ ] Admin Dashboard with Analytics
- [ ] File Upload for Incident Photos
- [ ] Email Notifications
- [ ] Calendar Integration for Bookings
- [ ] QR Code Check-in
- [ ] Mobile App (React Native)

---

## Security Measures

1. **Authentication**: JWT with 24-hour expiration
2. **Password Security**: BCrypt hashing
3. **Authorization**: Role-based access control
4. **CORS**: Configured for development
5. **Input Validation**: Server-side and client-side
6. **Error Handling**: Safe error messages
7. **SQL Injection Prevention**: JPA Parameterized Queries
8. **HTTPS**: Ready for production SSL/TLS

---

## Troubleshooting

### Backend Issues

1. **Database Connection Error**
   - Verify MySQL is running
   - Check credentials in application.properties
   - Ensure database exists

2. **Port 8080 Already in Use**
   ```bash
   # Windows
   netstat -ano | findstr :8080
   taskkill /PID <PID> /F
   ```

3. **Maven Build Issues**
   ```bash
   mvn clean install -U
   ```

### Frontend Issues

1. **Port 3000 Already in Use**
   ```bash
   npm run dev -- --port 3001
   ```

2. **API Connection Error**
   - Verify backend is running on port 8080
   - Check CORS configuration
   - Verify apiService.js has correct URLs

3. **Module Not Found**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

## Contributing Guidelines

1. Create feature branches: `git checkout -b feature/module-name`
2. Commit messages: `git commit -m "Feature: Description"`
3. Send pull requests for review
4. Ensure code follows project conventions
5. Test before submitting

---

## Contact & Support

For questions or issues:
- Email: support@smartcampus.edu
- Project Issues: GitHub Issues
- Documentation: See Wiki

---

## License

This project is licensed under the MIT License - see LICENSE file for details.

---

**Last Updated**: April 2026
**Version**: 1.0.0 (Facilities Management Module)
