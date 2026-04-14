# Quick Start Guide - Smart Campus Operations Hub

## Prerequisites Checklist
- [ ] Java 17 or higher installed
- [ ] Maven 3.6 or higher installed
- [ ] MySQL 8.0 or higher running
- [ ] Node.js 16 or higher installed
- [ ] npm or yarn package manager

---

## 5-Minute Setup

### Step 1: Database Setup (1 minute)

Open MySQL and execute:
```sql
CREATE DATABASE smart_campus_db;
USE smart_campus_db;
```

### Step 2: Start Backend (2 minutes)

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

**Expected Output:**
```
Smart Campus Backend Application Started Successfully
Server running on: http://localhost:8080/api
```

### Step 3: Start Frontend (1 minute)

Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```

**Expected Output:**
```
VITE v4.4.9  ready in 234 ms

➜  Local:   http://localhost:3000/
```

### Step 4: Test the Application (1 minute)

1. Open browser: http://localhost:3000
2. Click "Create one here" to sign up
3. Fill in the form with test data
4. View facilities on the dashboard

---

## Test Credentials

After signup, use the same email and password to login.

**Example Test User:**
- Email: `test@example.com`
- Password: `password123`
- Student ID: `ST12345`

---

## Default Admin User (Optional)

To add an admin user, execute in MySQL:
```sql
INSERT INTO smart_campus_db.users (
  email, password, full_name, student_id, 
  phone_number, department, role, active
) VALUES (
  'admin@smartcampus.com',
  '$2a$10$...', // BCrypt hash of "admin123"
  'Admin User',
  'ADM001',
  '+1-555-0000',
  'Administration',
  'ADMIN',
  true
);
```

---

## API Quick Test

### 1. Sign Up
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "fullName": "Test User",
    "studentId": "ST12345"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the returned `token` for authenticated requests.

### 3. Get All Facilities
```bash
curl -X GET http://localhost:8080/api/facilities \
  -H "Authorization: Bearer <token>"
```

### 4. Search Facilities
```bash
curl -X GET "http://localhost:8080/api/facilities/search?keyword=lab"
```

---

## Common Issues & Solutions

### Issue 1: "Connection refused" on backend startup
**Solution:**
- Ensure MySQL is running
- Check database credentials in `backend/src/main/resources/application.properties`

### Issue 2: "Port 8080 already in use"
**Solution (Windows):**
```bash
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Issue 3: "Module not found" in React
**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Issue 4: CORS errors
**Solution:**
- Verify both frontend and backend are running
- Check CORS configuration in `SecurityConfig.java`

---

## Project Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Port 3000)               │
│  - Login/Signup Pages                                       │
│  - Dashboard with Facilities Grid                           │
│  - Real-time Search & Filtering                             │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/JWT
                         │
┌────────────────────────▼────────────────────────────────────┐
│              Spring Boot Backend (Port 8080)                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Controllers: Auth, Facilities                        │   │
│  │ Services: Auth, Facility, UserDetails               │   │
│  │ Security: JWT Provider, Auth Filter                 │   │
│  │ Repositories: User, Facility JPA                    │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ SQL
                         │
┌────────────────────────▼────────────────────────────────────┐
│            MySQL Database (smart_campus_db)                 │
│  - users table                                              │
│  - facilities table                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Useful Commands

### Backend
```bash
# Clean build
mvn clean install

# Run specific tests
mvn test

# Generate API docs
mvn javadoc:javadoc

# Stop running server
Ctrl + C

# View logs
tail -f backend/target/spring-boot.log
```

### Frontend
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm build

# Preview production build
npm preview

# Run linter
npm run lint
```

---

## Next Steps

1. **Explore the Code:**
   - Backend entity classes in `backend/src/main/java/com/smartcampus/backend/entity/`
   - Frontend components in `frontend/src/components/` and `frontend/src/pages/`

2. **Add Sample Data:**
   - Use the API to create test facilities
   - Create multiple user accounts

3. **Test All Features:**
   - Sign up with different roles
   - Search and filter facilities
   - View facility details

4. **Customize:**
   - Update styling in `frontend/src/styles/`
   - Add new facility types or statuses
   - Implement additional features

---

## Documentation Links

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev)
- [JWT Documentation](https://jwt.io)
- [Vite Documentation](https://vitejs.dev)
- [MySQL Documentation](https://dev.mysql.com/doc/)

---

## Support

If you encounter any issues:
1. Check the Troubleshooting section above
2. Review backend logs in terminal
3. Check browser console for frontend errors
4. Verify all services are running

---

**Happy Coding! 🚀**
