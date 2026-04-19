# API Endpoints Documentation

## Authentication Endpoints

### 1. User Registration
**Endpoint:** `POST /api/auth/signup`

**Request Body:**
```json
{
  "email": "user@university.edu",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!",
  "fullName": "John Doe",
  "studentId": "STU001234",
  "phoneNumber": "+94701234567",
  "department": "Computer Science"
}
```

**Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "userId": "507f1f77bcf86cd799439011",
  "email": "user@university.edu",
  "fullName": "John Doe",
  "role": "STUDENT",
  "message": "User registered successfully"
}
```

### 2. User Login
**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@university.edu",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "userId": "507f1f77bcf86cd799439011",
  "email": "user@university.edu",
  "fullName": "John Doe",
  "role": "STUDENT",
  "message": "Login successful"
}
```

### 3. Refresh Token
**Endpoint:** `POST /api/auth/refresh-token`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "userId": "507f1f77bcf86cd799439011",
  "email": "user@university.edu",
  "fullName": "John Doe",
  "role": "STUDENT",
  "message": "Token refreshed successfully"
}
```

---

## Facilities Management Endpoints

### 1. Get All Facilities
**Endpoint:** `GET /api/facilities`

**Response (200 OK):**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Main Lecture Hall",
    "description": "Large auditorium for lectures",
    "type": "LECTURE_HALL",
    "capacity": 150,
    "location": "Building A",
    "building": "A",
    "floor": "1",
    "status": "ACTIVE",
    "equipment": "Projector, Whiteboard, Microphone",
    "imageUrl": "https://example.com/hall.jpg",
    "createdAt": "2026-03-24T10:30:00",
    "updatedAt": "2026-03-24T10:30:00"
  },
  {
    "id": "507f1f77bcf86cd799439012",
    "name": "Computer Lab 1",
    "description": "Laboratory for programming classes",
    "type": "LABORATORY",
    "capacity": 40,
    "location": "Building B",
    "building": "B",
    "floor": "2",
    "status": "ACTIVE",
    "equipment": "50 Desktop Computers, Server",
    "imageUrl": "https://example.com/lab.jpg",
    "createdAt": "2026-03-24T10:30:00",
    "updatedAt": "2026-03-24T10:30:00"
  }
]
```

### 2. Get Facility by ID
**Endpoint:** `GET /api/facilities/{id}`

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Main Lecture Hall",
  "description": "Large auditorium for lectures",
  "type": "LECTURE_HALL",
  "capacity": 150,
  "location": "Building A",
  "building": "A",
  "floor": "1",
  "status": "ACTIVE",
  "equipment": "Projector, Whiteboard, Microphone",
  "imageUrl": "https://example.com/hall.jpg",
  "createdAt": "2026-03-24T10:30:00",
  "updatedAt": "2026-03-24T10:30:00"
}
```

### 3. Search Facilities
**Endpoint:** `GET /api/facilities/search?keyword=lecture`

**Response (200 OK):**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Main Lecture Hall",
    "type": "LECTURE_HALL",
    "capacity": 150,
    "location": "Building A",
    "status": "ACTIVE"
  }
]
```

### 4. Get Facilities by Type
**Endpoint:** `GET /api/facilities/type/LECTURE_HALL`

**Response (200 OK):**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Main Lecture Hall",
    "type": "LECTURE_HALL",
    "capacity": 150,
    "location": "Building A",
    "status": "ACTIVE"
  }
]
```

### 5. Get Active Facilities
**Endpoint:** `GET /api/facilities/active/list`

**Response (200 OK):**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Main Lecture Hall",
    "type": "LECTURE_HALL",
    "capacity": 150,
    "location": "Building A",
    "status": "ACTIVE"
  }
]
```

### 6. Create Facility (ADMIN ONLY)
**Endpoint:** `POST /api/facilities`

**Headers:**
```
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "New Meeting Room",
  "description": "Small discussion room",
  "type": "MEETING_ROOM",
  "capacity": 20,
  "location": "Building C",
  "building": "C",
  "floor": "3",
  "status": "ACTIVE",
  "equipment": "Round Table, Projector"
}
```

**Response (201 Created):**
```json
{
  "id": "507f1f77bcf86cd799439013",
  "name": "New Meeting Room",
  "description": "Small discussion room",
  "type": "MEETING_ROOM",
  "capacity": 20,
  "location": "Building C",
  "building": "C",
  "floor": "3",
  "status": "ACTIVE",
  "equipment": "Round Table, Projector",
  "createdAt": "2026-03-25T14:20:00",
  "updatedAt": "2026-03-25T14:20:00"
}
```

### 7. Update Facility (ADMIN ONLY)
**Endpoint:** `PUT /api/facilities/{id}`

**Headers:**
```
Authorization: Bearer <ADMIN_TOKEN>
```

**Request Body:**
```json
{
  "name": "Updated Meeting Room",
  "capacity": 25,
  "status": "ACTIVE"
}
```

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439013",
  "name": "Updated Meeting Room",
  "capacity": 25,
  "status": "ACTIVE"
}
```

### 8. Delete Facility (ADMIN ONLY)
**Endpoint:** `DELETE /api/facilities/{id}`

**Headers:**
```
Authorization: Bearer <ADMIN_TOKEN>
```

**Response (200 OK):**
```json
{
  "message": "Facility deleted successfully"
}
```

---

## Booking Management Endpoints

### 1. Create Booking
**Endpoint:** `POST /api/bookings`

**Headers:**
```
X-User-Id: 507f1f77bcf86cd799439011
Content-Type: application/json
```

**Request Body:**
```json
{
  "facilityId": "507f1f77bcf86cd799439011",
  "bookingStart": "2026-04-10T09:00:00",
  "bookingEnd": "2026-04-10T10:30:00",
  "purpose": "Database Design Class",
  "expectedAttendees": 45
}
```

**Response (201 Created):**
```json
{
  "id": "507f1f77bcf86cd7994390aa",
  "facilityId": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439011",
  "bookingStart": "2026-04-10T09:00:00",
  "bookingEnd": "2026-04-10T10:30:00",
  "status": "PENDING",
  "purpose": "Database Design Class",
  "expectedAttendees": 45,
  "facilityName": "Main Lecture Hall",
  "createdAt": "2026-03-25T14:30:00"
}
```

### 2. Get Booking Details
**Endpoint:** `GET /api/bookings/{bookingId}`

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd7994390aa",
  "facilityId": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439011",
  "bookingStart": "2026-04-10T09:00:00",
  "bookingEnd": "2026-04-10T10:30:00",
  "status": "PENDING",
  "purpose": "Database Design Class",
  "expectedAttendees": 45,
  "facilityName": "Main Lecture Hall",
  "createdAt": "2026-03-25T14:30:00"
}
```

### 3. Get User Bookings
**Endpoint:** `GET /api/bookings/user/{userId}`

**Response (200 OK):**
```json
[
  {
    "id": "507f1f77bcf86cd7994390aa",
    "facilityId": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439011",
    "bookingStart": "2026-04-10T09:00:00",
    "bookingEnd": "2026-04-10T10:30:00",
    "status": "APPROVED",
    "purpose": "Database Design Class",
    "expectedAttendees": 45,
    "facilityName": "Main Lecture Hall",
    "createdAt": "2026-03-25T14:30:00"
  }
]
```

### 4. Get Pending Bookings (ADMIN ONLY)
**Endpoint:** `GET /api/bookings/admin/pending`

**Headers:**
```
Authorization: Bearer <ADMIN_TOKEN>
```

**Response (200 OK):**
```json
[
  {
    "id": "507f1f77bcf86cd7994390aa",
    "facilityId": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439011",
    "bookingStart": "2026-04-10T09:00:00",
    "bookingEnd": "2026-04-10T10:30:00",
    "status": "PENDING",
    "purpose": "Database Design Class",
    "expectedAttendees": 45,
    "facilityName": "Main Lecture Hall",
    "createdAt": "2026-03-25T14:30:00"
  }
]
```

### 5. Update Booking Status (ADMIN ONLY)
**Endpoint:** `PUT /api/bookings/{bookingId}/status`

**Headers:**
```
Authorization: Bearer <ADMIN_TOKEN>
```

**Request Body (Approve):**
```json
{
  "status": "APPROVED"
}
```

**Request Body (Reject):**
```json
{
  "status": "REJECTED",
  "rejectionReason": "Facility not available for that time"
}
```

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd7994390aa",
  "status": "APPROVED",
  "facilityName": "Main Lecture Hall"
}
```

**Trigger:** Sends notification to user about booking status.

### 6. Cancel Booking
**Endpoint:** `PUT /api/bookings/{bookingId}/cancel`

**Headers:**
```
Authorization: Bearer <USER_TOKEN>
```

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd7994390aa",
  "status": "CANCELLED",
  "facilityName": "Main Lecture Hall"
}
```

---

## Notification Endpoints

### 1. Get User Notifications
**Endpoint:** `GET /api/notifications/user/{userId}`

**Response (200 OK):**
```json
[
  {
    "id": "507f1f77bcf86cd7994390bb",
    "userId": "507f1f77bcf86cd799439011",
    "title": "Booking Approved",
    "message": "Your booking has been approved",
    "type": "BOOKING_APPROVED",
    "isRead": false,
    "relatedResourceId": "507f1f77bcf86cd7994390aa",
    "relatedResourceType": "BOOKING",
    "createdAt": "2026-03-25T14:35:00",
    "readAt": null
  },
  {
    "id": "507f1f77bcf86cd7994390cc",
    "userId": "507f1f77bcf86cd799439011",
    "title": "Facility Maintenance",
    "message": "Main Lecture Hall is under maintenance",
    "type": "FACILITY_MAINTENANCE",
    "isRead": true,
    "relatedResourceId": "507f1f77bcf86cd799439011",
    "relatedResourceType": "FACILITY",
    "createdAt": "2026-03-24T10:00:00",
    "readAt": "2026-03-24T10:15:00"
  }
]
```

### 2. Get Unread Notifications
**Endpoint:** `GET /api/notifications/user/{userId}/unread`

**Response (200 OK):**
```json
[
  {
    "id": "507f1f77bcf86cd7994390bb",
    "userId": "507f1f77bcf86cd799439011",
    "title": "Booking Approved",
    "message": "Your booking has been approved",
    "type": "BOOKING_APPROVED",
    "isRead": false,
    "createdAt": "2026-03-25T14:35:00"
  }
]
```

### 3. Get Unread Count
**Endpoint:** `GET /api/notifications/user/{userId}/unread-count`

**Response (200 OK):**
```json
{
  "unreadCount": 3
}
```

### 4. Mark Notification as Read
**Endpoint:** `PUT /api/notifications/{notificationId}/read`

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd7994390bb",
  "userId": "507f1f77bcf86cd799439011",
  "title": "Booking Approved",
  "isRead": true,
  "readAt": "2026-03-25T15:00:00"
}
```

### 5. Mark All Notifications as Read
**Endpoint:** `PUT /api/notifications/user/{userId}/read-all`

**Response (200 OK):**
```json
{
  "message": "All notifications marked as read"
}
```

### 6. Delete Notification
**Endpoint:** `DELETE /api/notifications/{notificationId}`

**Response (200 OK):**
```json
{
  "message": "Notification deleted successfully"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Email is already registered",
  "timestamp": "2026-03-25T15:05:00"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid credentials",
  "timestamp": "2026-03-25T15:05:00"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to perform this action",
  "timestamp": "2026-03-25T15:05:00"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Facility not found with id: 507f1f77bcf86cd799439999",
  "timestamp": "2026-03-25T15:05:00"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "timestamp": "2026-03-25T15:05:00"
}
```

---

## HTTP Methods Summary

| Method | Purpose | Example |
|--------|---------|---------|
| GET | Retrieve data | GET /api/facilities |
| POST | Create new resource | POST /api/bookings |
| PUT | Update existing resource | PUT /api/facilities/{id} |
| DELETE | Remove resource | DELETE /api/facilities/{id} |

## Authentication

All protected endpoints require an Authorization header with a Bearer token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Role-Based Access

- **ADMIN**: Full access to all endpoints
- **LECTURER**: Can create/manage own bookings
- **TECHNICIAN**: Can view facilities and manage maintenance
- **STUDENT**: Can create/manage own bookings

## Rate Limiting

Current implementation: No rate limiting (can be added for production)

## Pagination

Current implementation: Returns all results (pagination can be added)

## Sorting

Current implementation: Default sorting applied (customizable per endpoint)
