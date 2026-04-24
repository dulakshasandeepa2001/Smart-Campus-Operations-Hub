package com.smartcampus.backend.repository;

import com.smartcampus.backend.entity.Invitation;
import com.smartcampus.backend.entity.InvitationStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvitationRepository extends MongoRepository<Invitation, String> {
    Optional<Invitation> findByInvitationToken(String token);
    Optional<Invitation> findByEmailAndStatus(String email, InvitationStatus status);
    List<Invitation> findByStatus(InvitationStatus status);
    List<Invitation> findByCreatedBy(String adminId);
    Boolean existsByEmail(String email);
    Boolean existsByLecturerId(String lecturerId);
}
