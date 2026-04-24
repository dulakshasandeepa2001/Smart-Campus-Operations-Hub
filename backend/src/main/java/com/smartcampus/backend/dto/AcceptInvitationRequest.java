package com.smartcampus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

public class AcceptInvitationRequest {
    @NotBlank(message = "Invitation token is required")
    private String invitationToken;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9\\-\\+\\(\\)\\s]+$", message = "Phone number should contain only numbers, dashes, or parentheses")
    private String phoneNumber;

    public AcceptInvitationRequest() {}

    public AcceptInvitationRequest(String invitationToken, String password, String phoneNumber) {
        this.invitationToken = invitationToken;
        this.password = password;
        this.phoneNumber = phoneNumber;
    }

    // Getters
    public String getInvitationToken() { return invitationToken; }
    public String getPassword() { return password; }
    public String getPhoneNumber() { return phoneNumber; }

    // Setters
    public void setInvitationToken(String invitationToken) { this.invitationToken = invitationToken; }
    public void setPassword(String password) { this.password = password; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
}
