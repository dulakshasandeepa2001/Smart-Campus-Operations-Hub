package com.smartcampus.backend.repository;

import com.smartcampus.backend.entity.TicketComment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketCommentRepository extends MongoRepository<TicketComment, String> {
    // Find all comments for a specific ticket
    List<TicketComment> findByTicketId(String ticketId);
    
    // Find comments by author
    List<TicketComment> findByAuthorId(String authorId);
    
    // Delete all comments for a ticket
    void deleteByTicketId(String ticketId);
}
