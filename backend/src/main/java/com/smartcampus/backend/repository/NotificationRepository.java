package com.smartcampus.backend.repository;

import com.smartcampus.backend.entity.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(String userId);
    long countByUserIdAndIsReadFalse(String userId);
    List<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(String userId, Notification.NotificationType type);
}
