package com.smartcampus.controller;

import com.smartcampus.model.Notification;
import com.smartcampus.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    // Get notifications for current user
    @GetMapping("/{userId}")
    public ResponseEntity<List<Notification>> getNotifications(@PathVariable String userId) {
        List<Notification> notifications = notificationRepository.findByUserId(userId);
        return ResponseEntity.ok(notifications);
    }

    // Mark notification as read
    @PutMapping("/{id}/read")
    public ResponseEntity<String> markAsRead(@PathVariable String id) {
        Notification notification = notificationRepository.findById(id).orElse(null);
        if (notification != null) {
            notification.setRead(true);
            notificationRepository.save(notification);
            return ResponseEntity.ok("Notification marked as read");
        }
        return ResponseEntity.notFound().build();
    }

    // Create notification (for internal use, e.g., from other services)
    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        Notification saved = notificationRepository.save(notification);
        return ResponseEntity.ok(saved);
    }

    // Delete notification
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteNotification(@PathVariable String id) {
        if (notificationRepository.existsById(id)) {
            notificationRepository.deleteById(id);
            return ResponseEntity.ok("Notification deleted");
        }
        return ResponseEntity.notFound().build();
    }
}