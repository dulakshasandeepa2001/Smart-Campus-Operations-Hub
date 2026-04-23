# Implementation Guide: Authentication, Facilities Management & Notifications

## Overview
This document provides a comprehensive guide to the authentication, facilities management, and notifications features of the Smart Campus Operations Hub system.

## Architecture

### User Roles (4 Tiers)
1. **ADMIN** - System administrator who manages facilities, approves bookings, and oversees users
2. **LECTURER** - Faculty members who can book facilities for teaching sessions
3. **TECHNICIAN** - Maintenance staff who manage facility maintenance and repairs
4. **STUDENT** - Students who can browse and book available facilities

### Components Implemented

#### Backend (Spring Boot REST API)

##### Entities
- **User** - Enhanced with role field supporting 4 user types
- **Facility** - Represents campus resources (lecture halls, labs, etc.)
- **Booking** - Manages facility reservation requests
- **Notification** - System notifications for users

##### Controllers
1. **AuthController** (`/auth`)
   - POST `/auth/signup` - User registration
   - POST `/auth/login` - User login with authentication
   - POST `/auth/refresh-token` - Token refresh
   - GET `/auth/me` - Get current user

2. **FacilityController** (`/facilities`)
   - GET `/facilities` - List all facilities
   - GET `/facilities/{id}` - Get facility details
   - GET `/facilities/search` - Search facilities
   - GET `/facilities/type/{type}` - Filter by type
   - GET `/facilities/status/{status}` - Filter by status
   - GET `/facilities/active/list` - Get active facilities only
   - POST `/facilities` - Create facility (ADMIN only)
   - PUT `/facilities/{id}` - Update facility (ADMIN only)
   - DELETE `/facilities/{id}` - Delete facility (ADMIN only)

3. **BookingController** (`/bookings`)
   - POST `/bookings` - Create new booking request
   - GET `/bookings/{bookingId}` - Get booking details
   - GET `/bookings/user/{userId}` - Get user's bookings
   - GET `/bookings/facility/{facilityId}` - Get facility bookings
   - GET `/bookings/admin/pending` - Get pending bookings (ADMIN only)
   - PUT `/bookings/{bookingId}/status` - Approve/reject booking (ADMIN only)
   - PUT `/bookings/{bookingId}/cancel` - Cancel booking

4. **NotificationController** (`/notifications`)
   - GET `/notifications/user/{userId}` - Get user notifications
   - GET `/notifications/user/{userId}/unread` - Get unread notifications
   - GET `/notifications/user/{userId}/unread-count` - Get unread count
   - PUT `/notifications/{notificationId}/read` - Mark as read
   - PUT `/notifications/user/{userId}/read-all` - Mark all as read
   - DELETE `/notifications/{notificationId}` - Delete notification

##### Services
- **AuthService** - Handles user authentication and JWT token generation
- **FacilityService** - Facility CRUD operations and filtering
- **BookingService** - Booking management with conflict checking
- **NotificationService** - Notification creation and management

##### Repositories
- **UserRepository** - MongoDB queries for users
- **FacilityRepository** - MongoDB queries for facilities
- **BookingRepository** - MongoDB queries with conflict detection
- **NotificationRepository** - MongoDB queries for notifications

#### Frontend (React + Vite)

##### Dashboards (Role-Based)

1. **AdminDashboard**
   - Overview statistics (total facilities, active facilities, pending bookings)
   - Facility management (add, edit, delete)
   - Booking review and approval/rejection
   - System monitoring

2. **StudentDashboard**
   - Browse and search available facilities
   - Book facilities with date/time selection
   - View personal bookings
   - Receive booking status notifications
   - View notifications

3. **LecturerDashboard**
   - View teaching schedule
   - Book lecture halls and labs
   - Manage class bookings
   - View available teaching resources

4. **TechnicianDashboard**
   - View facility maintenance status
   - Manage assigned maintenance tasks
   - Update task progress
   - System health overview

##### Components
- **AdminDashboard.jsx** - Admin-specific interface
- **StudentDashboard.jsx** - Student-specific interface
- **LecturerDashboard.jsx** - Lecturer-specific interface
- **TechnicianDashboard.jsx** - Technician-specific interface
- **PrivateRoute.jsx** - Enhanced with role-based access control

##### Services
- **apiService.js** - HTTP client for API communication
- **authStore.js** - Zustand store for authentication state

##### Styling
- **dashboards.css** - Comprehensive styling for all dashboards
- Modern gradient backgrounds
- Responsive grid layouts
- Interactive cards and modals
- Status-based color coding

## Feature Details

### 1. Authentication & Authorization

#### Registration Flow
```
User → SignupPage → AuthController.signup() → UserService
→ Database → JWT Token → AuthStore → Dashboard
```

#### Login Flow
```
User → LoginPage → AuthController.login() → JWT Authentication
→ User Object → AuthStore → Role-Based Dashboard Routing
```

#### Role-Based Access Control
- Each endpoint is protected with `@PreAuthorize` annotations
- Dashboard routing enforces role-based access
- PrivateRoute component validates user roles

#### Supported Roles
- ADMIN - Full system access
- LECTURER - Facility booking and management
- TECHNICIAN - Maintenance and repair management
- STUDENT - Facility browsing and basic booking

### 2. Facilities Management

#### Facility Types
- LECTURE_HALL
- LABORATORY
- MEETING_ROOM
- EQUIPMENT
- STUDY_AREA
- AUDITORIUM

#### Facility Status
- ACTIVE - Available for booking
- OUT_OF_SERVICE - Not available
- MAINTENANCE - Under maintenance
- RETIRED - Decommissioned

#### Booking Workflow
```
Student initiates booking → Pending status → 
Admin reviews → Approvalor Rejection →
Notification sent → Booking confirmed/rejected
```

#### Conflict Prevention
- System checks for overlapping bookings
- Prevents double-booking of facilities
- Time-based availability validation

### 3. Notifications

#### Notification Types
- BOOKING_APPROVED
- BOOKING_REJECTED
- BOOKING_CANCELLED
- TICKET_UPDATED
- COMMENT_ADDED
- FACILITY_AVAILABLE
- FACILITY_MAINTENANCE
- ROLE_ASSIGNED
- GENERAL

#### Notification Features
- Real-time notification delivery
- Unread notification tracking
- Mark as read functionality
- Notification deletion
- Filtered by notification type

#### Notification Triggers
- Booking status changes
- Facility maintenance alerts
- Role assignments
- System announcements

### 4. Booking Management

#### Booking Statuses
- PENDING - Awaiting admin approval
- APPROVED - Confirmed and active
- REJECTED - Denied by admin
- CANCELLED - User-initiated cancellation

#### Booking Information
- Facility ID and name
- User ID and details
- Start and end date/time
- Purpose of booking
- Expected attendees
- Rejection reason (if applicable)

## Database Schema

### MongoDB Collections

#### Users Collection
```json
{
  "_id": "ObjectId",
  "email": "string",
  "password": "hashed_string",
  "fullName": "string",
  "studentId": "string",
  "phoneNumber": "string",
  "department": "string",
  "role": "ADMIN|LECTURER|TECHNICIAN|STUDENT",
  "active": "boolean",
  "createdAt": "LocalDateTime",
  "updatedAt": "LocalDateTime"
}
```

#### Facilities Collection
```json
{
  "_id": "ObjectId",
  "name": "string",
  "description": "string",
  "type": "LECTURE_HALL|LABORATORY|...",
  "capacity": "integer",
  "location": "string",
  "building": "string",
  "floor": "string",
  "status": "ACTIVE|OUT_OF_SERVICE|...",
  "equipment": "string",
  "imageUrl": "string",
  "createdAt": "LocalDateTime",
  "updatedAt": "LocalDateTime"
}
```

#### Bookings Collection
```json
{
  "_id": "ObjectId",
  "facilityId": "string",
  "userId": "string",
  "bookingStart": "LocalDateTime",
  "bookingEnd": "LocalDateTime",
  "status": "PENDING|APPROVED|REJECTED|CANCELLED",
  "purpose": "string",
  "expectedAttendees": "integer",
  "rejectionReason": "string",
  "createdAt": "LocalDateTime",
  "updatedAt": "LocalDateTime"
}
```

#### Notifications Collection
```json
{
  "_id": "ObjectId",
  "userId": "string",
  "title": "string",
  "message": "string",
  "type": "BOOKING_APPROVED|BOOKING_REJECTED|...",
  "isRead": "boolean",
  "relatedResourceId": "string",
  "relatedResourceType": "string",
  "createdAt": "LocalDateTime",
  "readAt": "LocalDateTime"
}
```

## HTTP Methods & Status Codes

### Standard Status Codes
- **200 OK** - Successful GET/PUT request
- **201 CREATED** - Successful POST request
- **204 NO CONTENT** - Successful DELETE request
- **400 BAD REQUEST** - Invalid input data
- **401 UNAUTHORIZED** - Authentication required
- **403 FORBIDDEN** - Insufficient permissions
- **404 NOT FOUND** - Resource not found
- **500 INTERNAL SERVER ERROR** - Server error

### Endpoint HTTP Methods

#### Facilities
- GET /facilities - List all
- GET /facilities/{id} - Get by ID
- POST /facilities - Create (ADMIN)
- PUT /facilities/{id} - Update (ADMIN)
- DELETE /facilities/{id} - Delete (ADMIN)

#### Bookings
- GET /bookings/{id} - Get details
- POST /bookings - Create request
- PUT /bookings/{id}/status - Update status (ADMIN)
- PUT /bookings/{id}/cancel - Cancel

#### Notifications
- GET /notifications/user/{userId} - Get all
- PUT /notifications/{id}/read - Mark read
- DELETE /notifications/{id} - Delete

## Security Best Practices

1. **JWT Authentication**
   - Tokens generated on login
   - Tokens include user ID and role
   - Token validation on protected endpoints

2. **Password Security**
   - Passwords hashed using BCrypt
   - Minimum password requirements
   - No passwords sent in responses

3. **Authorization**
   - Role-based access control on backend
   - Role-based routing on frontend
   - Endpoint protection with @PreAuthorize

4. **Input Validation**
   - DateTime range validation
   - Required field validation
   - Data type validation

5. **CORS Protection**
   - Allowed origins: localhost:3000, localhost:5173
   - Credentials support enabled

## UI/UX Features

### Admin Dashboard
- Statistics cards with quick metrics
- Tabbed interface for different sections
- Facility management form
- Pending bookings review panel
- Color-coded status indicators

### Student Dashboard
- Beautiful facility browsing grid
- Type-based filtering
- Booking modal with datetime picker
- Personal bookings history
- Notification center

### Lecturer Dashboard
- Teaching schedule overview
- Class booking management
- Available resources display
- Color-coded booking status
- Emoji-enhanced visual indicators

### Technician Dashboard
- System health overview
- Priority-based task management
- Facility status grid
- Task progress tracking
- Color-coded priority levels

## Error Handling

### Frontend
- Try-catch blocks on all API calls
- User-friendly error messages
- Console error logging
- Form validation

### Backend
- Custom exception classes
- Global exception handler
- Meaningful HTTP status codes
- Detailed error responses

## Future Enhancement Possibilities

1. **OAuth 2.0 Integration**
   - Google Sign-in
   - Microsoft OAuth
   - SAML integration

2. **Real-time Updates**
   - WebSocket notifications
   - Live facility availability
   - Real-time booking updates

3. **Advanced Features**
   - File attachments for tickets
   - Recurring bookings
   - Resource conflicts resolution
   - Advanced analytics dashboard

4. **Mobile App**
   - React Native application
   - Native push notifications
   - Offline capability

## Testing Recommendations

### Unit Tests
- AuthService tests
- BookingService tests
- FacilityService tests
- NotificationService tests

### Integration Tests
- Booking conflict detection
- Notification triggers
- Role-based access control
- Database queries

### E2E Tests
- Complete booking workflow
- Admin approval workflow
- Notification delivery
- Dashboard rendering

## Deployment Notes

### Backend Requirements
- Java 11+
- Spring Boot 3.0+
- MongoDB instance
- Maven build tool

### Frontend Requirements
- Node.js 16+
- React 18+
- Vite build tool
- npm/yarn package manager

### Environment Configuration
- JWT secret key
- MongoDB connection string
- CORS allowed origins
- OAuth credentials (if enabled)

## Support & Maintenance

### Common Issues
- **Booking creation fails**: Check facility availability and time range
- **Dashboard not loading**: Verify user role is set correctly
- **Notifications not appearing**: Check if user ID is correctly set

### Logging
- Backend: Check logs in application console
- Frontend: Check browser console for errors
- Database: Monitor MongoDB connection status

## Conclusion

This implementation provides a complete, production-ready system for managing campus operations with comprehensive authentication, facilities management, and notification systems. The 4-role design ensures flexible access control while maintaining security and data integrity.

For questions or issues, please refer to the API testing guide and debug logs.
