package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.AcceptInvitationRequest;
import com.smartcampus.backend.dto.InvitationDTO;
import com.smartcampus.backend.dto.SendInvitationRequest;
import com.smartcampus.backend.service.InvitationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/invitations")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class InvitationController {

    @Autowired
    private InvitationService invitationService;

    /**
     * Send invitation to lecturer (Admin only)
     * POST /api/invitations/send
     */
    @PostMapping("/send")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> sendInvitation(@Valid @RequestBody SendInvitationRequest request) {
        try {
            // Get current admin user ID from security context
            String adminId = getCurrentUserId();
            
            InvitationDTO invitation = invitationService.sendLecturerInvitation(
                request.getEmail(),
                request.getFullName(),
                request.getLecturerId(),
                adminId
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Invitation sent successfully to " + request.getEmail());
            response.put("invitation", invitation);
            
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to send invitation: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Accept invitation (Public - used by lecturers)
     * POST /api/invitations/accept
     */
    @PostMapping("/accept")
    public ResponseEntity<?> acceptInvitation(@Valid @RequestBody AcceptInvitationRequest request) {
        try {
            invitationService.acceptInvitation(
                request.getInvitationToken(),
                request.getPassword(),
                request.getPhoneNumber()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Invitation accepted successfully. Your account has been created.");
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to accept invitation: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get invitation details by token (Public - used by lecturers)
     * GET /api/invitations/{token}
     */
    @GetMapping("/{token}")
    public ResponseEntity<?> getInvitation(@PathVariable String token) {
        try {
            InvitationDTO invitation = invitationService.getInvitationByToken(token);
            return new ResponseEntity<>(invitation, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Get all pending invitations (Admin only)
     * GET /api/invitations/pending
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPendingInvitations() {
        try {
            List<InvitationDTO> invitations = invitationService.getPendingInvitations();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", invitations.size());
            response.put("invitations", invitations);
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to retrieve pending invitations: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get all invitations sent by current admin (Admin only)
     * GET /api/invitations/my-invitations
     */
    @GetMapping("/my-invitations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getMyInvitations() {
        try {
            String adminId = getCurrentUserId();
            List<InvitationDTO> invitations = invitationService.getInvitationsByAdmin(adminId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", invitations.size());
            response.put("invitations", invitations);
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to retrieve invitations: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Helper method to get current user ID from Security Context
     */
    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            Object principal = auth.getPrincipal();
            if (principal instanceof String) {
                return (String) principal;
            } else if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
                return ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
            }
            return auth.getName();
        }
        return "SYSTEM";
    }
}
