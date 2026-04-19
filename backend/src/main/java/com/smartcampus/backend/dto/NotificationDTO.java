package com.smartcampus.backend.dto;

import com.smartcampus.backend.entity.Notification.NotificationType;
import java.time.LocalDateTime;

public class NotificationDTO {
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

    public NotificationDTO() {}

    public NotificationDTO(String id, String userId, String title, String message, 
                          NotificationType type, Boolean isRead, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.message = message;
        this.type = type;
        this.isRead = isRead;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }
    
    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }
    
    public String getRelatedResourceId() { return relatedResourceId; }
    public void setRelatedResourceId(String relatedResourceId) { this.relatedResourceId = relatedResourceId; }
    
    public String getRelatedResourceType() { return relatedResourceType; }
    public void setRelatedResourceType(String relatedResourceType) { this.relatedResourceType = relatedResourceType; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }
}
