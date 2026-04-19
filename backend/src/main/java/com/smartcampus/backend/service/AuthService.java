package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.LoginRequest;
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

    @Transactional
    public AuthResponse signup(SignupRequest signupRequest) {
        // Validate input
        if (!signupRequest.getPassword().equals(signupRequest.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
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
}
