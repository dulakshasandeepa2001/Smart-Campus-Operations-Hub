package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.InvitationDTO;
import com.smartcampus.backend.entity.Invitation;
import com.smartcampus.backend.entity.InvitationStatus;
import com.smartcampus.backend.entity.User;
import com.smartcampus.backend.repository.InvitationRepository;
import com.smartcampus.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class InvitationService {

    private static final Logger logger = LoggerFactory.getLogger(InvitationService.class);
    private static final int INVITATION_EXPIRY_DAYS = 7;

    @Autowired
    private InvitationRepository invitationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public InvitationDTO sendLecturerInvitation(String email, String fullName, String lecturerId, String adminId) {
        logger.info("Sending invitation to lecturer: {} with email: {}", fullName, email);

        // Check if user already exists with this email
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("User with this email already exists");
        }

        // Check if lecturer already has an invitation
        if (invitationRepository.existsByLecturerId(lecturerId)) {
            throw new IllegalArgumentException("Lecturer with this ID already has an invitation");
        }

        // Check if email already has an active invitation
        Optional<Invitation> existingInvitation = invitationRepository.findByEmailAndStatus(email, InvitationStatus.PENDING);
        if (existingInvitation.isPresent()) {
            // Delete old invitation and create a new one
            invitationRepository.delete(existingInvitation.get());
        }

        // Generate unique invitation token
        String invitationToken = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusDays(INVITATION_EXPIRY_DAYS);

        Invitation invitation = new Invitation(email, fullName, lecturerId, invitationToken, expiryDate, adminId);
        Invitation savedInvitation = invitationRepository.save(invitation);

        // Send invitation email
        emailService.sendInvitationEmail(email, fullName, invitationToken);

        logger.info("Invitation sent successfully to: {}", email);
        return convertToDTO(savedInvitation);
    }

    @Transactional
    public Invitation acceptInvitation(String invitationToken, String password, String phoneNumber) {
        logger.info("Processing invitation acceptance for token: {}", invitationToken);

        Invitation invitation = invitationRepository.findByInvitationToken(invitationToken)
            .orElseThrow(() -> new IllegalArgumentException("Invalid or expired invitation token"));

        // Check if invitation has expired
        if (LocalDateTime.now().isAfter(invitation.getExpiryDate())) {
            invitation.setStatus(InvitationStatus.EXPIRED);
            invitationRepository.save(invitation);
            throw new IllegalArgumentException("Invitation has expired");
        }

        // Check if invitation is still pending
        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new IllegalArgumentException("This invitation has already been used");
        }

        // Create new user with lecturer role
        User lecturer = new User();
        lecturer.setEmail(invitation.getEmail());
        lecturer.setPassword(passwordEncoder.encode(password)); // Encrypt password using BCrypt
        lecturer.setFullName(invitation.getFullName());
        lecturer.setLecturerId(invitation.getLecturerId());
        lecturer.setPhoneNumber(phoneNumber);
        lecturer.setRole(User.UserRole.LECTURER);
        lecturer.setActive(true);
        lecturer.setCreatedAt(LocalDateTime.now());
        lecturer.setUpdatedAt(LocalDateTime.now());

        // Save the user with encrypted password
        userRepository.save(lecturer);

        // Mark invitation as accepted
        invitation.setStatus(InvitationStatus.ACCEPTED);
        invitation.setUpdatedAt(LocalDateTime.now());
        invitationRepository.save(invitation);

        logger.info("Invitation accepted and lecturer account created for: {}", invitation.getEmail());
        return invitation;
    }

    public InvitationDTO getInvitationByToken(String token) {
        Invitation invitation = invitationRepository.findByInvitationToken(token)
            .orElseThrow(() -> new IllegalArgumentException("Invitation not found"));
        return convertToDTO(invitation);
    }

    public List<InvitationDTO> getPendingInvitations() {
        return invitationRepository.findByStatus(InvitationStatus.PENDING)
            .stream()
            .filter(inv -> LocalDateTime.now().isBefore(inv.getExpiryDate()))
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public List<InvitationDTO> getInvitationsByAdmin(String adminId) {
        return invitationRepository.findByCreatedBy(adminId)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @Transactional
    public void expireOldInvitations() {
        List<Invitation> pendingInvitations = invitationRepository.findByStatus(InvitationStatus.PENDING);
        for (Invitation invitation : pendingInvitations) {
            if (LocalDateTime.now().isAfter(invitation.getExpiryDate())) {
                invitation.setStatus(InvitationStatus.EXPIRED);
                invitationRepository.save(invitation);
            }
        }
        logger.info("Expired invitations have been marked as expired");
    }

    private InvitationDTO convertToDTO(Invitation invitation) {
        return new InvitationDTO(
            invitation.getId(),
            invitation.getEmail(),
            invitation.getFullName(),
            invitation.getLecturerId(),
            invitation.getStatus().getDisplayName(),
            invitation.getExpiryDate(),
            invitation.getCreatedAt()
        );
    }
}
