# API Testing Guide - Smart Campus Operations Hub

Complete guide to test all API endpoints with curl commands and examples.

---

## Base URL
```
http://localhost:8080/api
```

---

## Authentication Endpoints

### 1. Sign Up - Create New User Account

**Endpoint:** `POST /auth/signup`  
**Authentication:** Not required  
**Response Code:** 201 Created

**Request:**
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "Password123",
    "confirmPassword": "Password123",
    "fullName": "John Doe",
    "studentId": "ST001",
    "phoneNumber": "+1-234-567-8900",
    "department": "Computer Science"
  }'
```

**Successful Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzc0MDAwMDAwLCJleHAiOjE3NzQwODYwMDB9.signature",
  "type": "Bearer",
  "userId": 1,
  "email": "student@example.com",
  "fullName": "John Doe",
  "role": "USER",
  "message": "User registered successfully"
}
```

**Error Responses:**
- 400 Bad Request: Email already exists, passwords don't match, etc.

---

### 2. Login - Authenticate User

**Endpoint:** `POST /auth/login`  
**Authentication:** Not required  
**Response Code:** 200 OK

**Request:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "Password123"
  }'
```

**Successful Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "userId": 1,
  "email": "student@example.com",
  "fullName": "John Doe",
  "role": "USER",
  "message": "Login successful"
}
```

**Error Response (400):**
```json
{
  "status": 400,
  "message": "Invalid email or password",
  "timestamp": 1774000000000
}
```

---

### 3. Refresh Token

**Endpoint:** `POST /auth/refresh-token`  
**Authentication:** Required (Bearer Token)  
**Response Code:** 200 OK

**Request:**
```bash
curl -X POST http://localhost:8080/api/auth/refresh-token \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.newtoken...",
  "type": "Bearer",
  "userId": 1,
  "email": "student@example.com",
  "fullName": "John Doe",
  "role": "USER",
  "message": "Token refreshed successfully"
}
```

---

## Facilities Endpoints

### Get Authorization Token First
```bash
# Save token in variable for reuse
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 1. Get All Facilities

**Endpoint:** `GET /facilities`  
**Authentication:** Required  
**Response Code:** 200 OK

**Request:**
```bash
curl -X GET http://localhost:8080/api/facilities \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Lecture Hall A",
    "description": "Large lecture hall with modern equipment",
    "type": "LECTURE_HALL",
    "capacity": 100,
    "location": "Building A, Wing 1",
    "building": "Building A",
    "floor": "1",
    "status": "ACTIVE",
    "equipment": "Projector, Screen, Microphone, Air Conditioning",
    "imageUrl": null
  },
  {
    "id": 2,
    "name": "Computer Lab 1",
    "description": "Lab with 30 workstations",
    "type": "LAB",
    "capacity": 30,
    "location": "Building B, Floor 2",
    "building": "Building B",
    "floor": "2",
    "status": "ACTIVE",
    "equipment": "30 Computers, Projector, Network Printer",
    "imageUrl": null
  }
]
```

---

### 2. Get Facility by ID

**Endpoint:** `GET /facilities/{id}`  
**Authentication:** Not required  
**Response Code:** 200 OK

**Request:**
```bash
curl -X GET http://localhost:8080/api/facilities/1
```

**Response:**
```json
{
  "id": 1,
  "name": "Lecture Hall A",
  "description": "Large lecture hall with modern equipment",
  "type": "LECTURE_HALL",
  "capacity": 100,
  "location": "Building A, Wing 1",
  "building": "Building A",
  "floor": "1",
  "status": "ACTIVE",
  "equipment": "Projector, Screen, Microphone, Air Conditioning",
  "imageUrl": null
}
```

**Error Response (404):**
```json
{
  "status": 404,
  "message": "Facility not found with id: 999",
  "timestamp": 1774000000000
}
```

---

### 3. Search Facilities

**Endpoint:** `GET /facilities/search?keyword={keyword}`  
**Authentication:** Not required  
**Response Code:** 200 OK

**Requests:**
```bash
# Search by name
curl -X GET "http://localhost:8080/api/facilities/search?keyword=Lecture"

# Search by location
curl -X GET "http://localhost:8080/api/facilities/search?keyword=Building%20A"

# Search by building
curl -X GET "http://localhost:8080/api/facilities/search?keyword=lab"
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Lecture Hall A",
    "description": "Large lecture hall with modern equipment",
    "type": "LECTURE_HALL",
    "capacity": 100,
    "location": "Building A, Wing 1",
    "building": "Building A",
    "floor": "1",
    "status": "ACTIVE",
    "equipment": "Projector, Screen, Microphone, Air Conditioning",
    "imageUrl": null
  }
]
```

---

### 4. Get Facilities by Type

**Endpoint:** `GET /facilities/type/{type}`  
**Authentication:** Required  
**Response Code:** 200 OK

**Valid Types:** LECTURE_HALL, LAB, MEETING_ROOM, AUDITORIUM, EQUIPMENT

**Request:**
```bash
curl -X GET http://localhost:8080/api/facilities/type/LAB \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
[
  {
    "id": 2,
    "name": "Computer Lab 1",
    "type": "LAB",
    "capacity": 30,
    ...
  }
]
```

---

### 5. Get Facilities by Status

**Endpoint:** `GET /facilities/status/{status}`  
**Authentication:** Required  
**Response Code:** 200 OK

**Valid Statuses:** ACTIVE, OUT_OF_SERVICE, MAINTENANCE, INACTIVE

**Request:**
```bash
curl -X GET http://localhost:8080/api/facilities/status/ACTIVE \
  -H "Authorization: Bearer $TOKEN"
```

---

### 6. Get Facilities by Capacity

**Endpoint:** `GET /facilities/capacity/{capacity}`  
**Authentication:** Required  
**Response Code:** 200 OK

**Returns facilities with capacity >= specified number**

**Request:**
```bash
# Get facilities with capacity of at least 50 people
curl -X GET http://localhost:8080/api/facilities/capacity/50 \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Lecture Hall A",
    "capacity": 100,
    ...
  },
  {
    "id": 3,
    "name": "Auditorium",
    "capacity": 500,
    ...
  }
]
```

---

### 7. Create Facility (Admin Only)

**Endpoint:** `POST /facilities`  
**Authentication:** Required (Admin role)  
**Response Code:** 201 Created

**Request:**
```bash
curl -X POST http://localhost:8080/api/facilities \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Meeting Room 101",
    "description": "Small meeting room with video conferencing",
    "type": "MEETING_ROOM",
    "capacity": 12,
    "location": "Building C, Floor 1",
    "building": "Building C",
    "floor": "1",
    "status": "ACTIVE",
    "equipment": "Projector, Video Conference System, whiteboard"
  }'
```

**Successful Response (201):**
```json
{
  "id": 5,
  "name": "Meeting Room 101",
  "description": "Small meeting room with video conferencing",
  "type": "MEETING_ROOM",
  "capacity": 12,
  "location": "Building C, Floor 1",
  "building": "Building C",
  "floor": "1",
  "status": "ACTIVE",
  "equipment": "Projector, Video Conference System, whiteboard",
  "imageUrl": null
}
```

**Error Response (403):**
```json
{
  "status": 403,
  "message": "Access denied - Admin role required",
  "timestamp": 1774000000000
}
```

---

### 8. Update Facility (Admin Only)

**Endpoint:** `PUT /facilities/{id}`  
**Authentication:** Required (Admin role)  
**Response Code:** 200 OK

**Request:**
```bash
curl -X PUT http://localhost:8080/api/facilities/5 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated meeting room with new equipment",
    "capacity": 20,
    "status": "MAINTENANCE",
    "equipment": "Projector, Video Conference System, whiteboard, Smart TV"
  }'
```

**Response:**
```json
{
  "id": 5,
  "name": "Meeting Room 101",
  "description": "Updated meeting room with new equipment",
  "type": "MEETING_ROOM",
  "capacity": 20,
  "location": "Building C, Floor 1",
  "building": "Building C",
  "floor": "1",
  "status": "MAINTENANCE",
  "equipment": "Projector, Video Conference System, whiteboard, Smart TV",
  "imageUrl": null
}
```

---

### 9. Delete Facility (Admin Only)

**Endpoint:** `DELETE /facilities/{id}`  
**Authentication:** Required (Admin role)  
**Response Code:** 204 No Content

**Request:**
```bash
curl -X DELETE http://localhost:8080/api/facilities/5 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Response:** No content (204)

**Error Response (404):**
```json
{
  "status": 404,
  "message": "Facility not found with id: 999",
  "timestamp": 1774000000000
}
```

---

## Testing Workflow

### Complete Test Flow:

**Step 1: Sign Up**
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPass123",
    "confirmPassword": "TestPass123",
    "fullName": "Test User",
    "studentId": "ST999"
  }'

# Save the returned token
TOKEN="<returned_token_from_response>"
```

**Step 2: View All Facilities**
```bash
curl -X GET http://localhost:8080/api/facilities \
  -H "Authorization: Bearer $TOKEN"
```

**Step 3: Search Facilities**
```bash
curl -X GET "http://localhost:8080/api/facilities/search?keyword=lab"
```

**Step 4: Filter by Type**
```bash
curl -X GET http://localhost:8080/api/facilities/type/LECTURE_HALL \
  -H "Authorization: Bearer $TOKEN"
```

**Step 5: Filter by Capacity**
```bash
curl -X GET http://localhost:8080/api/facilities/capacity/50 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Postman Collection Template

Save as `postman_collection.json`:

```json
{
  "info": {
    "name": "Smart Campus Facilities API",
    "version": "1.0.0"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Sign Up",
          "request": {
            "method": "POST",
            "url": "http://localhost:8080/api/auth/signup"
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "http://localhost:8080/api/auth/login"
          }
        }
      ]
    },
    {
      "name": "Facilities",
      "item": [
        {
          "name": "Get All",
          "request": {
            "method": "GET",
            "url": "http://localhost:8080/api/facilities",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ]
          }
        }
      ]
    }
  ]
}
```

---

## Common Headers

All authenticated requests should include:
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

---

## Error Codes Reference

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input, validation error |
| 401 | Unauthorized | Invalid/missing token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unexpected backend error |

---

## Tips for API Testing

1. **Save Token**: Store JWT token in an environment variable for multiple requests
2. **Test Order**: Start with signup, then login, then use public/authenticated endpoints
3. **Error Cases**: Test with invalid data (negative capacity, invalid email, etc.)
4. **Pagination**: API returns all results (implement pagination later if needed)
5. **CORS**: Frontend and backend must be running on correct ports

---

**Happy Testing!** 🧪
