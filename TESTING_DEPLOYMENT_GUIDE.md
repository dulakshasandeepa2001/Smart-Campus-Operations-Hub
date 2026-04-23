# Testing & Deployment Guide

## Quick Start Setup

### Backend Setup

#### Prerequisites
- Java 11 or higher
- Maven 3.6+
- MongoDB instance (local or cloud)

#### Installation Steps

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Update MongoDB Connection** (if needed)
   - Open `src/main/resources/application.properties`
   - Update MongoDB URI if using different database
   ```properties
   spring.data.mongodb.uri=mongodb+srv://username:password@cluster.mongodb.net/database_name
   ```

3. **Build the project**
   ```bash
   mvn clean install
   ```

4. **Run the application**
   ```bash
   mvn spring-boot:run
   ```
   
   Or run the compiled JAR:
   ```bash
   java -jar target/smart-campus-backend-1.0.0.jar
   ```

The backend will start on `http://localhost:8080/api`

### Frontend Setup

#### Prerequisites
- Node.js 16 or higher
- npm or yarn

#### Installation Steps

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## Testing the Application

### Test User Credentials (Create these first)

#### 1. Admin User
```
Email: admin@university.edu
Password: AdminPass123!
Role: ADMIN
```

#### 2. Lecturer User
```
Email: lecturer@university.edu
Password: LecturerPass123!
Role: LECTURER
```

#### 3. Technician User
```
Email: technician@university.edu
Password: TechnicianPass123!
Role: TECHNICIAN
```

#### 4. Student User
```
Email: student@university.edu
Password: StudentPass123!
Role: STUDENT
```

### Testing Workflows

#### Test 1: User Registration & Login (5 minutes)
1. Navigate to `http://localhost:5173/signup`
2. Fill in the registration form with student data
3. Click "Sign Up"
4. Should see success message and redirect to dashboard
5. Try logging out and logging back in
6. Verify the Student Dashboard loads

#### Test 2: Admin Facility Management (10 minutes)
1. Login as admin user
2. Navigate to Admin Dashboard
3. Click "Manage Facilities" tab
4. Add a new facility:
   - Name: "Test Lecture Hall"
   - Type: LECTURE_HALL
   - Capacity: 100
   - Building: A
   - Floor: 1
5. Verify facility appears in the list
6. Check database to confirm it was saved

#### Test 3: Student Booking Request (10 minutes)
1. Login as student user
2. Click "Browse Facilities"
3. Select a facility to book
4. Fill in booking details:
   - Date: 2 days from now
   - Time: 09:00 - 10:30
   - Purpose: "Study Session"
   - Attendees: 5
5. Click "Submit Booking Request"
6. Verify booking appears in "My Bookings" with PENDING status
7. Check notifications

#### Test 4: Admin Booking Approval (5 minutes)
1. Login as admin user
2. Click "Review Bookings" tab
3. Find the pending booking from student
4. Click "Approve" or "Reject"
5. If rejecting, enter a reason
6. Logout and login as student
7. Check booking status changed and notification received

#### Test 5: Notifications System (5 minutes)
1. Perform Test 4 (approve/reject booking)
2. Login as student immediately after
3. Check notifications (should show booking status)
4. Click on notification (should mark as read)
5. Check unread count should decrease

#### Test 6: Booking Conflict Detection (5 minutes)
1. Login as student
2. Create first booking: 2026-04-15, 10:00-11:00
3. Try creating second booking: 2026-04-15, 10:30-11:30 (same facility)
4. Should see error: "Facility has conflicts with existing bookings"

#### Test 7: Role-Based Access (5 minutes)
1. Login as student
2. Try to navigate to `/dashboard/admin`
3. Should redirect back to student dashboard
4. Verify student can only see student dashboard features

#### Test 8: Facilities Search & Filter (5 minutes)
1. Login as any user
2. On facilities page, type in search box
3. Try filtering by facility type
4. Verify results update correctly

### Using Postman for API Testing

#### 1. Setup Postman Collection
- Create new collection: "Smart Campus API"

#### 2. Test Authentication
```
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "student@university.edu",
  "password": "StudentPass123!"
}
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "userId": "...",
  "role": "STUDENT",
  "fullName": "Student Name"
}
```

#### 3. Test Facilities Endpoint
```
GET http://localhost:8080/api/facilities
Authorization: Bearer <token_from_login>
```

#### 4. Test Create Booking
```
POST http://localhost:8080/api/bookings
Authorization: Bearer <token>
X-User-Id: <userId>
Content-Type: application/json

{
  "facilityId": "facility_id_here",
  "bookingStart": "2026-04-15T10:00:00",
  "bookingEnd": "2026-04-15T11:00:00",
  "purpose": "Study session",
  "expectedAttendees": 5
}
```

#### 5. Test Get Notifications
```
GET http://localhost:8080/api/notifications/user/<userId>
Authorization: Bearer <token>
```

## Database Verification

### MongoDB Queries to Verify Data

#### Check Users Created
```javascript
db.users.find()
```

#### Check Facilities
```javascript
db.facilities.find().pretty()
```

#### Check Bookings
```javascript
db.bookings.find().pretty()
```

#### Check Notifications
```javascript
db.notifications.find().pretty()
```

#### Count Collections
```javascript
db.users.countDocuments()
db.facilities.countDocuments()
db.bookings.countDocuments()
db.notifications.countDocuments()
```

## Performance Testing

### Load Testing Recommendations

#### 1. API Response Times
- Expected: < 200ms for GET requests
- Expected: < 500ms for POST requests
- Expected: < 300ms for PUT requests

#### 2. Database Queries
- Use MongoDB profiler to check slow queries
- Index frequently queried fields

#### 3. Frontend Performance
- Open DevTools → Performance tab
- Record dashboard loading
- Check for unnecessary re-renders

## Deployment Guide

### Deploy Backend (Docker)

#### 1. Create Dockerfile
```dockerfile
FROM openjdk:11-jre-slim
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

#### 2. Build Docker Image
```bash
docker build -t smart-campus-backend .
```

#### 3. Run Container
```bash
docker run -p 8080:8080 -e SPRING_DATA_MONGODB_URI=<mongodb_uri> smart-campus-backend
```

### Deploy Frontend (Vercel/Netlify)

#### 1. Build for Production
```bash
npm run build
```

#### 2. Deploy to Vercel
```bash
npm install -g vercel
vercel
```

#### 3. Deploy to Netlify
```bash
# Using CLI
npm install -g netlify-cli
netlify deploy --prod --dir=dist

# Or drag and drop dist folder to Netlify
```

### Environment Variables for Production

#### Backend (application-prod.properties)
```properties
spring.data.mongodb.uri=${MONGODB_URI}
app.jwtSecret=${JWT_SECRET}
cors.allowedOrigins=https://yourdomain.com
```

#### Frontend (.env.production)
```
VITE_API_URL=https://api.yourdomain.com
```

## Monitoring & Maintenance

### Backend Monitoring
- Check application logs for errors
- Monitor database connection pool
- Track API response times
- Monitor disk usage for logs

### Frontend Monitoring
- Monitor JavaScript errors in console
- Check network requests in DevTools
- Monitor performance metrics
- Check for memory leaks

### Database Monitoring
- Monitor MongoDB connection status
- Check collection sizes
- Monitor query performance
- Check disk space

## Troubleshooting Common Issues

### Issue 1: Backend Won't Start
**Symptoms**: Connection error or port already in use
**Solution**: 
```bash
# Check if port 8080 is in use
lsof -i :8080
# Kill process using that port
kill -9 <PID>
```

### Issue 2: MongoDB Connection Error
**Symptoms**: "Unable to connect to MongoDB"
**Solution**:
- Verify MongoDB is running
- Check connection string in application.properties
- Verify network access for MongoDB Atlas

### Issue 3: Frontend Not Connecting to Backend
**Symptoms**: CORS errors in console
**Solution**:
- Check CORS configuration in SecurityConfig
- Verify API endpoint in apiService.js
- Check localhost vs network address

### Issue 4: Bookings Not Creating
**Symptoms**: 400 Bad Request error
**Solution**:
- Verify DateTime format is ISO 8601
- Check facility exists
- Verify all required fields are provided

### Issue 5: Notifications Not Appearing
**Symptoms**: No notifications in dashboard
**Solution**:
- Verify user ID is correctly set
- Check notification service is called
- Verify database has notification records

## Git Commands for Version Control

### Initial Setup
```bash
git init
git add .
git commit -m "Initial commit: Authentication, Facilities, Notifications"
git remote add origin <repository_url>
git push -u origin main
```

### Regular Commits
```bash
# Stage changes
git add src/main/java/...
git add frontend/src/...

# Commit with descriptive message
git commit -m "feat: Add booking conflict detection"

# Push to remote
git push origin main
```

### Feature Branches (Recommended)
```bash
# Create feature branch
git checkout -b feature/oauth-integration

# Work on feature
# ... make changes ...

# Commit and push
git add .
git commit -m "feat: Implement OAuth 2.0 integration"
git push origin feature/oauth-integration

# Create pull request on GitHub
```

## CI/CD Pipeline with GitHub Actions

### Example Workflow (.github/workflows/build.yml)
```yaml
name: Build and Test

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Java
      uses: actions/setup-java@v2
      with:
        java-version: '11'
    
    - name: Build backend
      run: |
        cd backend
        mvn clean package
    
    - name: Set up Node
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    
    - name: Build frontend
      run: |
        cd frontend
        npm install
        npm run build
```

## Performance Optimization Tips

### Backend
1. Add database indexes on frequently queried fields
2. Implement pagination for list endpoints
3. Add caching for facility listings
4. Use database connection pooling

### Frontend
1. Implement lazy loading for dashboards
2. Optimize images with compression
3. Split code with React.lazy()
4. Use production build with optimization

### Database
1. Create indexes on userId, facilityId, bookingStart, bookingEnd
2. Archive old notifications
3. Compress notification collection
4. Regular database backups

## Testing Checklist

- [ ] All 30+ API endpoints working
- [ ] Authentication flow complete
- [ ] All 4 dashboards accessible with correct role
- [ ] Booking conflict detection working
- [ ] Notifications sent on booking updates
- [ ] CRUD operations on facilities working
- [ ] Search and filtering working
- [ ] Error messages displaying correctly
- [ ] UI responsive on mobile devices
- [ ] CSS animations smooth
- [ ] Forms validate input correctly
- [ ] Logout works properly
- [ ] Role-based access control enforced
- [ ] Database records created/updated correctly
- [ ] No console errors on frontend
- [ ] No console errors on backend

## Final Pre-Submission Checklist

- [ ] All code committed to Git
- [ ] Compilation successful (no warnings)
- [ ] All endpoints tested with Postman
- [ ] All dashboards tested with test accounts
- [ ] Documentation complete
- [ ] README updated with setup instructions
- [ ] No hardcoded sensitive information
- [ ] CORS properly configured
- [ ] Error handling implemented
- [ ] User input validated
- [ ] Code follows Java/React best practices
- [ ] Performance acceptable
- [ ] Security measures in place
- [ ] Ready for demo/viva

## Support Contact Points

- **Backend Issues**: Check Spring Boot logs
- **Frontend Issues**: Check browser console (F12)
- **Database Issues**: MongoDB admin features
- **API Issues**: Use Postman for debugging
- **General Help**: Refer to IMPLEMENTATION_GUIDE.md

---

**You're all set! Happy testing and deployment! 🚀**
