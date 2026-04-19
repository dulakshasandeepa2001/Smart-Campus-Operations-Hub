package com.smartcampus.backend.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;
    private String userId;
    private String title;
    private String message;
    private NotificationType type;
    private Boolean isRead;
    private String relatedResourceId;
    private String relatedResourceType;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;

    public Notification() {
        this.isRead = false;
        this.createdAt = LocalDateTime.now();
    }

    public Notification(String userId, String title, String message, NotificationType type, 
                       String relatedResourceId, String relatedResourceType) {
        this.userId = userId;
        this.title = title;
        this.message = message;
        this.type = type;
        this.relatedResourceId = relatedResourceId;
        this.relatedResourceType = relatedResourceType;
        this.isRead = false;
        this.createdAt = LocalDateTime.now();
    }

    public enum NotificationType {
        BOOKING_APPROVED,
        BOOKING_REJECTED,
        BOOKING_CANCELLED,
        TICKET_UPDATED,
        COMMENT_ADDED,
        FACILITY_AVAILABLE,
        FACILITY_MAINTENANCE,
        ROLE_ASSIGNED,
        GENERAL
    }

    // Getters
    public String getId() { return id; }
    public String getUserId() { return userId; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public NotificationType getType() { return type; }
    public Boolean getIsRead() { return isRead; }
    public String getRelatedResourceId() { return relatedResourceId; }
    public String getRelatedResourceType() { return relatedResourceType; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getReadAt() { return readAt; }

    // Setters
    public void setId(String id) { this.id = id; }
    public void setUserId(String userId) { this.userId = userId; }
    public void setTitle(String title) { this.title = title; }
    public void setMessage(String message) { this.message = message; }
    public void setType(NotificationType type) { this.type = type; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }
    public void setRelatedResourceId(String relatedResourceId) { this.relatedResourceId = relatedResourceId; }
    public void setRelatedResourceType(String relatedResourceType) { this.relatedResourceType = relatedResourceType; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }
}
