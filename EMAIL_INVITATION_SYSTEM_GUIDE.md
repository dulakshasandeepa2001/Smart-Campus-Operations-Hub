# Email Invitation System Implementation Guide

## Overview
This document provides a complete guide for the newly implemented email invitation system for the Smart Campus Operations Hub. This system allows **Admins only** to send invitation emails to **Lecturers only**, enabling them to activate their accounts.

## Features Implemented

### 1. **Backend Implementation**

#### Email Service Configuration
- **SMTP Server**: Gmail (sandeepadulaksha93@gmail.com)
- **Port**: 587 (TLS)
- **Authentication**: Gmail App Password required

#### Key Components Created

##### a. **Entities**
- `Invitation.java` - Stores invitation records
- `InvitationStatus.java` - Enum for invitation states (PENDING, ACCEPTED, EXPIRED, REJECTED)

##### b. **Repositories**
- `InvitationRepository.java` - Database operations for invitations

##### c. **Services**
- `EmailService.java` - Handles email sending via Gmail SMTP
- `InvitationService.java` - Business logic for invitation management

##### d. **Controllers**
- `InvitationController.java` - REST API endpoints (Admin-only for sending, public for accepting)

##### e. **DTOs**
- `InvitationDTO.java` - Data transfer object for invitations
- `SendInvitationRequest.java` - Request payload for sending invitations
- `AcceptInvitationRequest.java` - Request payload for accepting invitations

### 2. **Frontend Implementation**

#### Components
- `LecturerInvitationManager.jsx` - Admin panel for managing lecturer invitations
- `AcceptInvitationPage.jsx` - Page for lecturers to accept invitations

#### Styling
- `invitation.css` - Complete styling for invitation UI

### 3. **API Endpoints**

#### Admin Endpoints (Protected)
```
POST   /api/invitations/send                 - Send invitation to lecturer
GET    /api/invitations/pending              - Get all pending invitations
GET    /api/invitations/my-invitations       - Get invitations sent by current admin
```

#### Public Endpoints
```
GET    /api/invitations/{token}              - Get invitation details by token
POST   /api/invitations/accept               - Accept invitation and create lecturer account
```

## Setup Instructions

### Step 1: Gmail Configuration

1. **Enable 2-Factor Authentication** in your Gmail account
2. **Generate App Password**:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Navigate to "App passwords" (appears only if 2FA is enabled)
   - Select "Mail" and "Windows Computer"
   - Copy the 16-character password

3. **Update `application.properties`**:
   ```properties
   spring.mail.username=sandeepadulaksha93@gmail.com
   spring.mail.password=YOUR_GENERATED_APP_PASSWORD
   ```

### Step 2: Build Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### Step 3: Build Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

### Step 4: Access Admin Panel

1. Login as Admin with your credentials
2. Go to Admin Dashboard
3. Click on "Lecturer Invitations" tab
4. Click "Send New Invitation" to invite a lecturer

## Workflow

### For Admins: Sending Invitations

1. **Navigate to Admin Dashboard** → **Lecturer Invitations Tab**
2. **Click "Send New Invitation"** and fill in:
   - Lecturer Email (e.g., dr.john@university.edu)
   - Full Name (e.g., Dr. John Doe)
   - Lecturer ID (e.g., LEC001)
3. **Click "Send Invitation"**
4. An HTML email is sent to the lecturer with:
   - Personalized greeting
   - Activation link with 7-day expiry
   - Instructions and important notes
5. **Track invitations** in the "My Invitations" or "All Pending" tabs

### For Lecturers: Accepting Invitations

1. **Receive Email** with invitation link
2. **Click the invitation link** which takes them to `/accept-invitation?token=XXXXX`
3. **Fill in Account Setup Form**:
   - Create Password (min 6 characters)
   - Confirm Password
   - Enter Phone Number
4. **Click "Activate Account"**
5. Account is created and they can login with email/password

## Database Structure

### Invitations Collection
```json
{
  "_id": "ObjectId",
  "email": "lecturer@university.edu",
  "fullName": "Dr. John Doe",
  "lecturerId": "LEC001",
  "invitationToken": "uuid-string",
  "status": "PENDING|ACCEPTED|EXPIRED|REJECTED",
  "expiryDate": "2026-04-29T10:00:00",
  "createdAt": "2026-04-22T10:00:00",
  "updatedAt": "2026-04-22T10:00:00",
  "createdBy": "admin-user-id"
}
```

## Email Template

The system sends beautifully formatted HTML emails with:
- Professional header with application branding
- Personalized greeting
- Clear call-to-action button
- Expiration details (7 days)
- Footer with privacy notice

## Security Features

✅ **Admin-Only Access** - Only users with ADMIN role can send invitations  
✅ **Token-Based** - Unique tokens for each invitation  
✅ **Expiration** - Invitations expire after 7 days  
✅ **Email Validation** - Prevents duplicate invitations for same email  
✅ **Role Restriction** - Lecturers only (not students or technicians)  
✅ **CORS Protected** - Cross-origin requests properly validated  
✅ **JWT Authentication** - Secure token-based authentication  

## Configuration Reference

### application.properties Gmail Settings
```properties
# Gmail SMTP Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=sandeepadulaksha93@gmail.com
spring.mail.password=YOUR_APP_PASSWORD
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.properties.mail.smtp.connectiontimeout=5000
spring.mail.properties.mail.smtp.timeout=5000
spring.mail.properties.mail.smtp.writetimeout=5000

# Email Configuration
app.email.from=sandeepadulaksha93@gmail.com
app.email.from-name=Smart Campus Operations Hub
```

## Troubleshooting

### Issue: "Failed to send invitation email"

**Solution**: 
- Verify Gmail credentials in `application.properties`
- Check if 2FA is enabled and app password is generated
- Ensure internet connection is active
- Check if Gmail account has "Less secure app access" disabled (2FA should handle this)

### Issue: "Invitation link not working"

**Solution**:
- Verify the invitation token in the database
- Check if invitation hasn't expired (7 days)
- Ensure CORS is properly configured
- Check browser console for network errors

### Issue: "Lecturer account not created after accepting invitation"

**Solution**:
- Check MongoDB connection
- Verify user doesn't already exist with same email
- Check server logs for exceptions
- Ensure password is at least 6 characters

## Future Enhancements

- [ ] Resend invitation emails
- [ ] Bulk invitation upload (CSV)
- [ ] Invitation status notifications
- [ ] Automatic reminder emails for expiring invitations
- [ ] Custom email templates
- [ ] SMS fallback for delivery

## Support

For issues or questions, refer to the backend logs:
```bash
# Check Spring Boot application logs
tail -f backend/logs/application.log
```

---

**Created**: April 22, 2026  
**Last Updated**: April 22, 2026  
**Version**: 1.0.0
