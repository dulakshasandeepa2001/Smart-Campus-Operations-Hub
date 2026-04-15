package com.smartcampus.controller;

import com.smartcampus.model.Role;
import com.smartcampus.model.RoleName;
import com.smartcampus.model.User;
import com.smartcampus.repository.RoleRepository;
import com.smartcampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/roles")
@PreAuthorize("hasRole('ADMIN')")
public class RoleController {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    // Get all roles
    @GetMapping
    public ResponseEntity<List<Role>> getAllRoles() {
        List<Role> roles = roleRepository.findAll();
        return ResponseEntity.ok(roles);
    }

    // Create role
    @PostMapping
    public ResponseEntity<Role> createRole(@RequestBody Role role) {
        Role saved = roleRepository.save(role);
        return ResponseEntity.ok(saved);
    }

    // Assign role to user
    @PostMapping("/assign")
    public ResponseEntity<String> assignRole(@RequestParam String userId, @RequestParam RoleName roleName) {
        Optional<User> userOpt = userRepository.findById(userId);
        Optional<Role> roleOpt = roleRepository.findByName(roleName);
        if (userOpt.isPresent() && roleOpt.isPresent()) {
            User user = userOpt.get();
            Set<RoleName> roles = user.getRoles();
            if (roles == null) roles = new HashSet<>();
            Set<RoleName> newRoles = new HashSet<>(roles);
            newRoles.add(roleName);
            user.setRoles(newRoles);
            userRepository.save(user);
            return ResponseEntity.ok("Role assigned successfully");
        }
        return ResponseEntity.badRequest().body("User or role not found");
    }

    // Remove role from user
    @PostMapping("/remove")
    public ResponseEntity<String> removeRole(@RequestParam String userId, @RequestParam RoleName roleName) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            Set<RoleName> roles = user.getRoles();
            if (roles != null) {
                Set<RoleName> newRoles = new HashSet<>(roles);
                newRoles.remove(roleName);
                user.setRoles(newRoles);
                userRepository.save(user);
            }
            return ResponseEntity.ok("Role removed successfully");
        }
        return ResponseEntity.notFound().build();
    }
}