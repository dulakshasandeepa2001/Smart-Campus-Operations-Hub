package com.smartcampus.backend.dto;

import java.time.LocalDateTime;

public class InvitationDTO {
    private String id;
    private String email;
    private String fullName;
    private String lecturerId;
    private String status;
    private LocalDateTime expiryDate;
    private LocalDateTime createdAt;

    public InvitationDTO() {}

    public InvitationDTO(String id, String email, String fullName, String lecturerId, 
                        String status, LocalDateTime expiryDate, LocalDateTime createdAt) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.lecturerId = lecturerId;
        this.status = status;
        this.expiryDate = expiryDate;
        this.createdAt = createdAt;
    }

    // Getters
    public String getId() { return id; }
    public String getEmail() { return email; }
    public String getFullName() { return fullName; }
    public String getLecturerId() { return lecturerId; }
    public String getStatus() { return status; }
    public LocalDateTime getExpiryDate() { return expiryDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // Setters
    public void setId(String id) { this.id = id; }
    public void setEmail(String email) { this.email = email; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public void setLecturerId(String lecturerId) { this.lecturerId = lecturerId; }
    public void setStatus(String status) { this.status = status; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
