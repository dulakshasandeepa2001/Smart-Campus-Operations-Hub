package com.smartcampus.backend.repository;

import com.smartcampus.backend.entity.Ticket;
import com.smartcampus.backend.entity.TicketStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {
    // Find tickets by student (created by)
    List<Ticket> findByCreatedById(String createdById);
    
    // Find tickets assigned to a user (lecturer/technician)
    List<Ticket> findByAssignedToId(String assignedToId);
    
    // Find unassigned tickets
    List<Ticket> findByAssignedToIsNull();
    
    // Find tickets by status
    List<Ticket> findByStatus(TicketStatus status);
    
    // Find tickets by priority
    List<Ticket> findByPriority(String priority);
    
    // Find tickets by category
    List<Ticket> findByCategory(String category);
    
    // Find tickets for a specific user (both created and assigned)
    List<Ticket> findByCreatedByIdOrAssignedToId(String createdById, String assignedToId);
    
    // Search tickets by title or description
    List<Ticket> findByTitleContainingIgnoreCase(String title);
    
    List<Ticket> findByDescriptionContainingIgnoreCase(String description);
}
