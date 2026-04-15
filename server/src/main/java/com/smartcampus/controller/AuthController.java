package com.smartcampus.controller;

import com.smartcampus.model.Role;
import com.smartcampus.model.RoleName;
import com.smartcampus.model.User;
import com.smartcampus.repository.RoleRepository;
import com.smartcampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Test endpoint
    @GetMapping("/test")
    public ResponseEntity<String> test(){
        return ResponseEntity.ok("Server is running!");
    }

    // Registration endpoint
    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody User user) {
        // Encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // Assign default role USER
        Optional<Role> userRole = roleRepository.findByName(RoleName.USER);
        if (userRole.isPresent()) {
            user.setRoles(Set.of(userRole.get().getName()));
        } else {
            // Create role if not exists
            Role role = new Role(RoleName.USER);
            roleRepository.save(role);
            user.setRoles(Set.of(RoleName.USER));
        }
        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully!");
    }

    // OAuth2 success endpoint
    @GetMapping("/oauth2/success")
    public ResponseEntity<Map<String, Object>> oauth2Success(@AuthenticationPrincipal OAuth2User oauth2User) {
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");

        // Check if user exists
        Optional<User> existingUser = userRepository.findByEmail(email);
        User user;
        if (existingUser.isPresent()) {
            user = existingUser.get();
        } else {
            // Create new user
            user = new User();
            user.setUsername(email);
            user.setEmail(email);
            user.setPassword(""); // OAuth users don't have password
            // Assign USER role
            Optional<Role> userRole = roleRepository.findByName(RoleName.USER);
            if (userRole.isPresent()) {
                user.setRoles(Set.of(userRole.get().getName()));
            } else {
                Role role = new Role(RoleName.USER);
                roleRepository.save(role);
                user.setRoles(Set.of(RoleName.USER));
            }
            userRepository.save(user);
        }

        return ResponseEntity.ok(Map.of(
            "message", "Login successful",
            "user", Map.of("username", user.getUsername(), "email", user.getEmail(), "roles", user.getRoles())
        ));
    }
}