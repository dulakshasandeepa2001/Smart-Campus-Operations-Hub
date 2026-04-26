package com.smartcampus.backend.controller;

import com.smartcampus.backend.entity.Ticket;
import com.smartcampus.backend.entity.TicketComment;
import com.smartcampus.backend.entity.TicketStatus;
import com.smartcampus.backend.entity.User;
import com.smartcampus.backend.dto.TicketDTO;
import com.smartcampus.backend.service.TicketService;
import com.smartcampus.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/tickets")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@PreAuthorize("hasAnyRole('STUDENT', 'LECTURER', 'TECHNICIAN', 'ADMIN')")
public class TicketController {
    @Autowired
    private TicketService ticketService;
    
    @Autowired
    private UserRepository userRepository;
    
    // Get technicians for assignment - Admin only
    @GetMapping("/technicians")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getTechnicians() {
        try {
            List<User> technicians = userRepository.findByRole(User.UserRole.TECHNICIAN);
            List<Map<String, Object>> technicianList = technicians.stream()
                    .map(tech -> new HashMap<String, Object>() {{
                        put("id", tech.getId());
                        put("fullName", tech.getFullName());
                        put("email", tech.getEmail());
                        put("role", tech.getRole());
                    }})
                    .collect(Collectors.toList());
            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("success", true);
                put("technicians", technicianList);
                put("count", technicianList.size());
            }});
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }
    
    // Create a new ticket - Students and Lecturers can create
    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER')")
    public ResponseEntity<?> createTicket(@RequestBody Ticket ticket, @RequestParam String userId) {
        try {
            if (userId == null || userId.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new HashMap<String, Object>() {{
                    put("success", false);
                    put("message", "User ID is required");
                }});
            }
            
            Ticket newTicket = ticketService.createTicket(ticket, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(new HashMap<String, Object>() {{
                put("success", true);
                put("message", "Ticket created successfully");
                put("ticket", ticketService.convertToDTO(newTicket));
            }});
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
                put("error", "VALIDATION_ERROR");
            }});
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage() != null ? e.getMessage() : "An error occurred while creating the ticket");
                put("error", "INTERNAL_ERROR");
            }});
        }
    }
    
    // Get all tickets - Admin only
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllTickets() {
        try {
            List<Ticket> tickets = ticketService.getAllTickets();
            List<TicketDTO> ticketDTOs = tickets.stream()
                    .map(ticketService::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("success", true);
                put("tickets", ticketDTOs);
                put("count", ticketDTOs.size());
            }});
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }
    
    // Get tickets by status
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getTicketsByStatus(@PathVariable String status) {
        try {
            TicketStatus ticketStatus = TicketStatus.valueOf(status.toUpperCase());
            List<Ticket> tickets = ticketService.getTicketsByStatus(ticketStatus);
            List<TicketDTO> ticketDTOs = tickets.stream()
                    .map(ticketService::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("success", true);
                put("tickets", ticketDTOs);
            }});
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }
    
    // Get student's tickets
    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getStudentTickets(@PathVariable String studentId) {
        try {
            List<Ticket> tickets = ticketService.getStudentTickets(studentId);
            List<TicketDTO> ticketDTOs = tickets.stream()
                    .map(ticketService::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("success", true);
                put("tickets", ticketDTOs);
            }});
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }
    
    // Get tickets assigned to user
    @GetMapping("/assigned/{userId}")
    public ResponseEntity<?> getAssignedTickets(@PathVariable String userId) {
        try {
            List<Ticket> tickets = ticketService.getAssignedTickets(userId);
            List<TicketDTO> ticketDTOs = tickets.stream()
                    .map(ticketService::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("success", true);
                put("tickets", ticketDTOs);
            }});
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }
    
    // Get unassigned tickets - Admin only
    @GetMapping("/unassigned")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUnassignedTickets() {
        try {
            List<Ticket> tickets = ticketService.getUnassignedTickets();
            List<TicketDTO> ticketDTOs = tickets.stream()
                    .map(ticketService::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("success", true);
                put("tickets", ticketDTOs);
            }});
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }
    
    // Get single ticket
    @GetMapping("/{ticketId}")
    public ResponseEntity<?> getTicket(@PathVariable String ticketId) {
        try {
            Ticket ticket = ticketService.getTicketById(ticketId);
            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("success", true);
                put("ticket", ticketService.convertToDTO(ticket));
            }});
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }
    
    // Assign ticket - Admin only
    @PutMapping("/{ticketId}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> assignTicket(@PathVariable String ticketId, 
                                          @RequestParam String assignedToId) {
        try {
            Ticket ticket = ticketService.assignTicket(ticketId, assignedToId);
            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("success", true);
                put("message", "Ticket assigned successfully");
                put("ticket", ticketService.convertToDTO(ticket));
            }});
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }
    
    // Update ticket status - Technician and Admin can update
    @PutMapping("/{ticketId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN', 'LECTURER')")
    public ResponseEntity<?> updateTicketStatus(@PathVariable String ticketId, 
                                                @RequestParam String status) {
        try {
            TicketStatus ticketStatus = TicketStatus.valueOf(status.toUpperCase());
            Ticket ticket = ticketService.updateTicketStatus(ticketId, ticketStatus);
            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("success", true);
                put("message", "Ticket status updated successfully");
                put("ticket", ticketService.convertToDTO(ticket));
            }});
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }
    
    // Add comment
    @PostMapping("/{ticketId}/comment")
    public ResponseEntity<?> addComment(@PathVariable String ticketId, 
                                       @RequestParam String userId, 
                                       @RequestBody Map<String, String> request) {
        try {
            String commentText = request.get("comment");
            TicketComment comment = ticketService.addComment(ticketId, userId, commentText);
            return ResponseEntity.status(HttpStatus.CREATED).body(new HashMap<String, Object>() {{
                put("success", true);
                put("message", "Comment added successfully");
                put("comment", comment);
            }});
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }
    
    // Get ticket comments
    @GetMapping("/{ticketId}/comments")
    public ResponseEntity<?> getTicketComments(@PathVariable String ticketId) {
        try {
            List<Map<String, Object>> comments = ticketService.getTicketCommentsWithUserInfo(ticketId);
            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("success", true);
                put("comments", comments);
                put("count", comments.size());
            }});
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }
}
