package com.smartcampus.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleOAuthRequest {
    @NotBlank(message = "Google token is required")
    private String token;
    
    private String role; // Optional: can be STUDENT, LECTURER, TECHNICIAN
    
    public String getToken() {
        return this.token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getRole() {
        return this.role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
}
