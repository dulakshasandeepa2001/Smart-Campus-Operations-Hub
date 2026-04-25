package com.smartcampus.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class SendInvitationRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Lecturer ID is required")
    private String lecturerId;

    public SendInvitationRequest() {}

    public SendInvitationRequest(String email, String fullName, String lecturerId) {
        this.email = email;
        this.fullName = fullName;
        this.lecturerId = lecturerId;
    }

    // Getters
    public String getEmail() { return email; }
    public String getFullName() { return fullName; }
    public String getLecturerId() { return lecturerId; }

    // Setters
    public void setEmail(String email) { this.email = email; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public void setLecturerId(String lecturerId) { this.lecturerId = lecturerId; }
}
