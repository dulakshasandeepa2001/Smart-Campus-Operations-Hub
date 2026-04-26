package com.smartcampus.backend.service;

import com.smartcampus.backend.entity.Ticket;
import com.smartcampus.backend.entity.TicketComment;
import com.smartcampus.backend.entity.TicketStatus;
import com.smartcampus.backend.entity.User;
import com.smartcampus.backend.entity.Notification;
import com.smartcampus.backend.dto.TicketDTO;
import com.smartcampus.backend.repository.TicketRepository;
import com.smartcampus.backend.repository.TicketCommentRepository;
import com.smartcampus.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TicketService {
    @Autowired
    private TicketRepository ticketRepository;
    
    @Autowired
    private TicketCommentRepository ticketCommentRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private NotificationService notificationService;
    
    // Create a new ticket with validation
    public Ticket createTicket(Ticket ticket, String userId) {
        // Validate input
        if (ticket == null) {
            throw new IllegalArgumentException("Ticket cannot be null");
        }
        if (ticket.getTitle() == null || ticket.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Ticket title is required");
        }
        if (ticket.getTitle().length() < 3 || ticket.getTitle().length() > 200) {
            throw new IllegalArgumentException("Ticket title must be between 3 and 200 characters");
        }
        if (ticket.getDescription() == null || ticket.getDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("Ticket description is required");
        }
        if (ticket.getDescription().length() < 10 || ticket.getDescription().length() > 5000) {
            throw new IllegalArgumentException("Ticket description must be between 10 and 5000 characters");
        }
        if (ticket.getCategory() == null) {
            throw new IllegalArgumentException("Ticket category is required");
        }
        if (ticket.getPriority() == null) {
            throw new IllegalArgumentException("Ticket priority is required");
        }
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID is required");
        }
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        ticket.setCreatedBy(userOpt.get());
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setViewCount(0);
        ticket.setRead(false);
        
        Ticket savedTicket = ticketRepository.save(ticket);
        
        // Send notification to admins/technicians
        notifyAdminsNewTicket(savedTicket);
        
        return savedTicket;
    }
    
    // Get all tickets
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }
    
    // Get tickets by status
    public List<Ticket> getTicketsByStatus(TicketStatus status) {
        return ticketRepository.findByStatus(status);
    }
    
    // Get tickets created by a student
    public List<Ticket> getStudentTickets(String studentId) {
        return ticketRepository.findByCreatedById(studentId);
    }
    
    // Get tickets assigned to a user (lecturer/technician)
    public List<Ticket> getAssignedTickets(String userId) {
        return ticketRepository.findByAssignedToId(userId);
    }
    
    // Get unassigned tickets
    public List<Ticket> getUnassignedTickets() {
        return ticketRepository.findByAssignedToIsNull();
    }
    
    // Get all tickets for a user (created or assigned)
    public List<Ticket> getUserTickets(String userId) {
        return ticketRepository.findByCreatedByIdOrAssignedToId(userId, userId);
    }
    
    // Get single ticket by ID
    public Ticket getTicketById(String ticketId) {
        Optional<Ticket> ticket = ticketRepository.findById(ticketId);
        if (ticket.isEmpty()) {
            throw new RuntimeException("Ticket not found");
        }
        
        // Increment view count
        Ticket t = ticket.get();
        t.setViewCount(t.getViewCount() + 1);
        t.setRead(true);
        
        return ticketRepository.save(t);
    }
    
    // Assign ticket to a user with validation
    public Ticket assignTicket(String ticketId, String assignedToId) {
        if (ticketId == null || ticketId.trim().isEmpty()) {
            throw new IllegalArgumentException("Ticket ID is required");
        }
        if (assignedToId == null || assignedToId.trim().isEmpty()) {
            throw new IllegalArgumentException("Assigned to user ID is required");
        }
        
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        Optional<User> userOpt = userRepository.findById(assignedToId);
        
        if (ticketOpt.isEmpty()) {
            throw new RuntimeException("Ticket not found");
        }
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        Ticket ticket = ticketOpt.get();
        User assignedUser = userOpt.get();
        
        // Validate assigned user has appropriate role
        if (assignedUser.getRole() == null || 
            (!assignedUser.getRole().toString().equals("TECHNICIAN") && 
             !assignedUser.getRole().toString().equals("LECTURER"))) {
            throw new IllegalArgumentException("Can only assign tickets to Technicians or Lecturers");
        }
        
        ticket.setAssignedTo(assignedUser);
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        ticket.setUpdatedAt(LocalDateTime.now());
        
        Ticket savedTicket = ticketRepository.save(ticket);
        
        // Send email notification to assigned user
        emailService.sendNotificationEmail(assignedUser.getEmail(), 
            "Ticket Assigned to You", 
            "Ticket #" + ticket.getId() + " has been assigned to you: " + ticket.getTitle());
        
        // Create notification
        notificationService.createNotification(assignedUser.getId(), 
            "Ticket #" + ticket.getId() + " Assigned",
            "Ticket has been assigned to you: " + ticket.getTitle(),
            Notification.NotificationType.TICKET_UPDATED,
            ticket.getId(),
            "TICKET");
        
        return savedTicket;
    }
    
    // Update ticket status with validation
    public Ticket updateTicketStatus(String ticketId, TicketStatus newStatus) {
        if (ticketId == null || ticketId.trim().isEmpty()) {
            throw new IllegalArgumentException("Ticket ID is required");
        }
        if (newStatus == null) {
            throw new IllegalArgumentException("Status is required");
        }
        
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (ticketOpt.isEmpty()) {
            throw new RuntimeException("Ticket not found");
        }
        
        Ticket ticket = ticketOpt.get();
        TicketStatus oldStatus = ticket.getStatus();
        
        // Validate status transitions
        if (oldStatus == TicketStatus.CLOSED) {
            throw new IllegalArgumentException("Cannot update status of a closed ticket");
        }
        
        ticket.setStatus(newStatus);
        ticket.setUpdatedAt(LocalDateTime.now());
        
        if (newStatus == TicketStatus.RESOLVED || newStatus == TicketStatus.CLOSED) {
            ticket.setResolvedAt(LocalDateTime.now());
        }
        
        Ticket savedTicket = ticketRepository.save(ticket);
        
        // Notify the ticket creator
        notificationService.createNotification(ticket.getCreatedBy().getId(), 
            "Ticket #" + ticket.getId() + " Status Updated",
            "Your ticket status has been updated to: " + newStatus.name(),
            Notification.NotificationType.TICKET_UPDATED,
            ticket.getId(),
            "TICKET");
        
        return savedTicket;
    }
    
    // Add comment to ticket
    public TicketComment addComment(String ticketId, String userId, String commentText) {
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (ticketOpt.isEmpty() || userOpt.isEmpty()) {
            throw new RuntimeException("Ticket or User not found");
        }
        
        Ticket ticket = ticketOpt.get();
        User author = userOpt.get();
        
        TicketComment comment = new TicketComment(ticketId, author, commentText);
        TicketComment savedComment = ticketCommentRepository.save(comment);
        
        // Add comment ID to ticket's comment list
        ticket.getCommentIds().add(savedComment.getId());
        ticket.setUpdatedAt(LocalDateTime.now());
        ticketRepository.save(ticket);
        
        // Notify other participants
        notifyCommentAdded(ticket, author, commentText);
        
        return savedComment;
    }
    
    // Get comments for a ticket
    public List<TicketComment> getTicketComments(String ticketId) {
        return ticketCommentRepository.findByTicketId(ticketId);
    }
    
    // Get ticket comments as DTO with user info
    public List<Map<String, Object>> getTicketCommentsWithUserInfo(String ticketId) {
        List<TicketComment> comments = ticketCommentRepository.findByTicketId(ticketId);
        return comments.stream().map(comment -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", comment.getId());
            map.put("author", comment.getAuthor().getFullName());
            map.put("authorId", comment.getAuthor().getId());
            map.put("comment", comment.getComment());
            map.put("createdAt", comment.getCreatedAt());
            return map;
        }).collect(Collectors.toList());
    }
    
    // Convert Ticket to TicketDTO
    public TicketDTO convertToDTO(Ticket ticket) {
        TicketDTO dto = new TicketDTO();
        dto.setId(ticket.getId());
        dto.setTitle(ticket.getTitle());
        dto.setDescription(ticket.getDescription());
        dto.setStatus(ticket.getStatus());
        dto.setPriority(ticket.getPriority());
        dto.setCategory(ticket.getCategory());
        
        // Use fullName instead of firstName/lastName (User entity only has fullName)
        if (ticket.getCreatedBy() != null) {
            dto.setCreatedByName(ticket.getCreatedBy().getFullName());
            dto.setCreatedById(ticket.getCreatedBy().getId());
        }
        
        if (ticket.getAssignedTo() != null) {
            dto.setAssignedToName(ticket.getAssignedTo().getFullName());
            dto.setAssignedToId(ticket.getAssignedTo().getId());
        }
        
        dto.setCreatedAt(ticket.getCreatedAt());
        dto.setUpdatedAt(ticket.getUpdatedAt());
        dto.setResolvedAt(ticket.getResolvedAt());
        dto.setAttachmentUrl(ticket.getAttachmentUrl());
        dto.setAttachmentFileName(ticket.getAttachmentFileName());
        dto.setCommentCount(ticket.getCommentIds().size());
        dto.setViewCount(ticket.getViewCount());
        dto.setRead(ticket.isRead());
        
        return dto;
    }
    
    // Helper methods
    private void notifyAdminsNewTicket(Ticket ticket) {
        // Find all admin users by querying all users and filtering by role
        List<User> allUsers = userRepository.findAll();
        List<User> admins = allUsers.stream()
            .filter(u -> u.getRole() != null && u.getRole().toString().equals("ADMIN"))
            .collect(Collectors.toList());
        
        for (User admin : admins) {
            notificationService.createNotification(admin.getId(), 
                "New Ticket Created",
                "New ticket: " + ticket.getTitle() + " by " + ticket.getCreatedBy().getFullName(),
                Notification.NotificationType.TICKET_UPDATED,
                ticket.getId(),
                "TICKET");
        }
    }
    
    private void notifyCommentAdded(Ticket ticket, User author, String comment) {
        if (!ticket.getCreatedBy().getId().equals(author.getId())) {
            notificationService.createNotification(ticket.getCreatedBy().getId(), 
                "New Comment on Your Ticket",
                author.getFullName() + " added a comment to your ticket: " + ticket.getTitle(),
                Notification.NotificationType.COMMENT_ADDED,
                ticket.getId(),
                "TICKET");
        }
        
        if (ticket.getAssignedTo() != null && !ticket.getAssignedTo().getId().equals(author.getId())) {
            notificationService.createNotification(ticket.getAssignedTo().getId(), 
                "New Comment on Assigned Ticket",
                author.getFullName() + " added a comment to ticket: " + ticket.getTitle(),
                Notification.NotificationType.COMMENT_ADDED,
                ticket.getId(),
                "TICKET");
        }
    }
}
