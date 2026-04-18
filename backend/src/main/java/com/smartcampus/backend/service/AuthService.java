package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.ForgotPasswordRequest;
import com.smartcampus.backend.dto.GoogleOAuthRequest;
import com.smartcampus.backend.dto.LoginRequest;
import com.smartcampus.backend.dto.ResetPasswordRequest;
import com.smartcampus.backend.dto.SignupRequest;
import com.smartcampus.backend.dto.AuthResponse;
import com.smartcampus.backend.entity.User;
import com.smartcampus.backend.exception.BadRequestException;
import com.smartcampus.backend.exception.ResourceNotFoundException;
import com.smartcampus.backend.repository.UserRepository;
import com.smartcampus.backend.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.Base64;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private EmailService emailService;

    @org.springframework.beans.factory.annotation.Value("${app.google.client-id}")
    private String googleClientId;

    @Transactional
    public AuthResponse signup(SignupRequest signupRequest) {
        // Validate input
        if (!signupRequest.getPassword().equals(signupRequest.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        // Check if email already exists
        if (userRepository.existsByEmailIgnoreCase(signupRequest.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        // Check if trying to create multiple admins
        if ("ADMIN".equals(signupRequest.getRole())) {
            long adminCount = userRepository.countByRole(User.UserRole.ADMIN);
            if (adminCount > 0) {
                throw new BadRequestException("Only one administrator account is allowed in the system");
            }
        }

        // Check role-specific ID uniqueness
        if ("STUDENT".equals(signupRequest.getRole()) && signupRequest.getStudentId() != null) {
            if (userRepository.existsByStudentId(signupRequest.getStudentId())) {
                throw new BadRequestException("Student ID is already registered");
            }
        } else if ("LECTURER".equals(signupRequest.getRole()) && signupRequest.getLecturerId() != null) {
            if (userRepository.existsByLecturerId(signupRequest.getLecturerId())) {
                throw new BadRequestException("Lecture ID is already registered");
            }
        } else if ("TECHNICIAN".equals(signupRequest.getRole()) && signupRequest.getTechnicianId() != null) {
            if (userRepository.existsByTechnicianId(signupRequest.getTechnicianId())) {
                throw new BadRequestException("Technician ID is already registered");
            }
        }

        // Create new user
        User user = User.builder()
                .email(signupRequest.getEmail())
                .password(passwordEncoder.encode(signupRequest.getPassword()))
                .fullName(signupRequest.getFullName())
                .studentId(signupRequest.getStudentId())
                .phoneNumber(signupRequest.getPhoneNumber())
                .department(signupRequest.getDepartment())
                .lecturerId(signupRequest.getLecturerId())
                .lectureMail(signupRequest.getLectureMail())
                .technicianId(signupRequest.getTechnicianId())
                .privateMail(signupRequest.getPrivateMail())
                .role(User.UserRole.valueOf(signupRequest.getRole() != null ? signupRequest.getRole() : "STUDENT"))
                .active(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);

        String token = jwtTokenProvider.generateToken(savedUser.getId());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .role(savedUser.getRole().name())
                .message("User registered successfully")
                .build();
    }

    public AuthResponse login(LoginRequest loginRequest) {
        try {
            // Validate input
            if (loginRequest.getEmail() == null || loginRequest.getEmail().isEmpty()) {
                throw new BadRequestException("Email is required");
            }
            if (loginRequest.getPassword() == null || loginRequest.getPassword().isEmpty()) {
                throw new BadRequestException("Password is required");
            }

            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            // Get user from authentication principal
            CustomUserDetailsService.CustomUserDetails userDetails = (CustomUserDetailsService.CustomUserDetails) authentication.getPrincipal();
            User user = userDetails.getUser();

            // Check if user is active
            if (!Boolean.TRUE.equals(user.getActive())) {
                throw new BadRequestException("User account is inactive");
            }

            String token = jwtTokenProvider.generateToken(user.getId());

            return AuthResponse.builder()
                    .token(token)
                    .type("Bearer")
                    .userId(user.getId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .role(user.getRole().name())
                    .message("Login successful")
                    .build();

        } catch (BadRequestException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new BadRequestException("Invalid email or password");
        }
    }

    public User getUserById(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public AuthResponse refreshToken(String token) {
        if (jwtTokenProvider.validateToken(token)) {
            String userId = jwtTokenProvider.getUserIdFromJWT(token);
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            String newToken = jwtTokenProvider.generateToken(userId);

            return AuthResponse.builder()
                    .token(newToken)
                    .type("Bearer")
                    .userId(user.getId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .role(user.getRole().name())
                    .message("Token refreshed successfully")
                    .build();
        }

        throw new BadRequestException("Invalid token");
    }

    @Transactional
    public Map<String, String> requestPasswordReset(ForgotPasswordRequest request) {
        String message = "If an account exists for that email, a password reset link has been sent.";
        String email = request.getEmail().trim();

        userRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
            String resetToken = UUID.randomUUID().toString().replace("-", "");

            user.setPasswordResetToken(resetToken);
            user.setPasswordResetTokenExpiry(LocalDateTime.now().plusHours(1));
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);

            emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), resetToken);
        });

        return Map.of("message", message);
    }

    @Transactional
    public Map<String, String> resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        User user = userRepository.findByPasswordResetToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Password reset link is invalid or has expired"));

        if (user.getPasswordResetTokenExpiry() == null || user.getPasswordResetTokenExpiry().isBefore(LocalDateTime.now())) {
            user.setPasswordResetToken(null);
            user.setPasswordResetTokenExpiry(null);
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
            throw new BadRequestException("Password reset link has expired");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        return Map.of("message", "Password updated successfully. You can now sign in.");
    }

    @Transactional
    public AuthResponse googleOAuth(GoogleOAuthRequest request) {
        try {
            // Decode Google ID Token (JWT format)
            String token = request.getToken();
            String[] parts = token.split("\\.");
            
            if (parts.length != 3) {
                throw new BadRequestException("Invalid Google token format");
            }
            
            // Decode payload (second part)
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
            
            // Parse JSON payload
            String email = extractFieldFromJson(payload, "email");
            String name = extractFieldFromJson(payload, "name");
            
            if (email == null || email.isEmpty()) {
                throw new BadRequestException("Invalid Google token - missing email");
            }
            
            // Check if user exists
            User user = userRepository.findByEmailIgnoreCase(email).orElse(null);

            if (user == null) {
                // Auto-create new user with Google OAuth
                String userRole = (request.getRole() != null && !request.getRole().isEmpty()) 
                    ? request.getRole() 
                    : "STUDENT"; // Default role for Google OAuth users

                user = User.builder()
                        .email(email)
                        .fullName(name != null ? name : "Google User")
                        .role(User.UserRole.valueOf(userRole))
                        .password(passwordEncoder.encode(UUID.randomUUID().toString())) // Random password for OAuth users
                        .active(true)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();

                user = userRepository.save(user);
            }

            // Check if user is active
            if (!Boolean.TRUE.equals(user.getActive())) {
                throw new BadRequestException("User account is inactive");
            }

            // Generate JWT token
            String jwtToken = jwtTokenProvider.generateToken(user.getId());

            return AuthResponse.builder()
                    .token(jwtToken)
                    .type("Bearer")
                    .userId(user.getId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .role(user.getRole().name())
                    .message("Google login successful")
                    .build();

        } catch (BadRequestException ex) {
            throw ex;
        } catch (Exception e) {
            throw new BadRequestException("Invalid Google token: " + e.getMessage());
        }
    }
    
    // Helper method to extract fields from JSON string
    private String extractFieldFromJson(String json, String fieldName) {
        String searchKey = "\"" + fieldName + "\":\"";
        int startIdx = json.indexOf(searchKey);
        if (startIdx == -1) {
            return null;
        }
        startIdx += searchKey.length();
        int endIdx = json.indexOf("\"", startIdx);
        if (endIdx == -1) {
            return null;
        }
        return json.substring(startIdx, endIdx);
    }
}

