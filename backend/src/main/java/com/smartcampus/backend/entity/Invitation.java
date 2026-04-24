package com.smartcampus.backend.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "invitations")
public class Invitation {

    @Id
    private String id;
    private String email;
    private String fullName;
    private String lecturerId;
    private String invitationToken;
    private InvitationStatus status; // PENDING, ACCEPTED, EXPIRED
    private LocalDateTime expiryDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy; // Admin ID who created the invitation

    public Invitation() {}

    public Invitation(String email, String fullName, String lecturerId, String invitationToken, 
                     LocalDateTime expiryDate, String createdBy) {
        this.email = email;
        this.fullName = fullName;
        this.lecturerId = lecturerId;
        this.invitationToken = invitationToken;
        this.status = InvitationStatus.PENDING;
        this.expiryDate = expiryDate;
        this.createdBy = createdBy;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters
    public String getId() { return id; }
    public String getEmail() { return email; }
    public String getFullName() { return fullName; }
    public String getLecturerId() { return lecturerId; }
    public String getInvitationToken() { return invitationToken; }
    public InvitationStatus getStatus() { return status; }
    public LocalDateTime getExpiryDate() { return expiryDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public String getCreatedBy() { return createdBy; }

    // Setters
    public void setId(String id) { this.id = id; }
    public void setEmail(String email) { this.email = email; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public void setLecturerId(String lecturerId) { this.lecturerId = lecturerId; }
    public void setInvitationToken(String invitationToken) { this.invitationToken = invitationToken; }
    public void setStatus(InvitationStatus status) { this.status = status; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
