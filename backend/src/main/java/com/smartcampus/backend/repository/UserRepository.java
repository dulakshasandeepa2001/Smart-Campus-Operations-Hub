package com.smartcampus.backend.repository;

import com.smartcampus.backend.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByLectureMail(String lectureMail);
    Optional<User> findByStudentId(String studentId);
    Boolean existsByEmail(String email);
    Boolean existsByLectureMail(String lectureMail);
    Boolean existsByStudentId(String studentId);
    Boolean existsByLecturerId(String lecturerId);
    Boolean existsByTechnicianId(String technicianId);
    Long countByRole(User.UserRole role);
}
