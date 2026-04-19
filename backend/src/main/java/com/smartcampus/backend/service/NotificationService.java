package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.NotificationDTO;
import com.smartcampus.backend.entity.Notification;
import com.smartcampus.backend.entity.User;
import com.smartcampus.backend.repository.NotificationRepository;
import com.smartcampus.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Notification createNotification(String userId, String title, String message,
                                          Notification.NotificationType type,
                                          String relatedResourceId, String relatedResourceType) {
        Notification notification = new Notification(userId, title, message, type, 
                                                      relatedResourceId, relatedResourceType);
        return notificationRepository.save(notification);
    }

    public List<NotificationDTO> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<NotificationDTO> getUnreadNotifications(String userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public NotificationDTO markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);
        return convertToDTO(notification);
    }

    @Transactional
    public void markAllAsRead(String userId) {
        List<Notification> unreadNotifications = 
                notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unreadNotifications.forEach(n -> {
            n.setIsRead(true);
            n.setReadAt(LocalDateTime.now());
        });
        notificationRepository.saveAll(unreadNotifications);
    }

    @Transactional
    public void deleteNotification(String notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    public List<NotificationDTO> getNotificationsByType(String userId, Notification.NotificationType type) {
        return notificationRepository.findByUserIdAndTypeOrderByCreatedAtDesc(userId, type)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void createBulkNotificationsForStudentGroup(String department, Integer studentYear, String studentGroup,
                                                       String title, String message, 
                                                       String bookingId, String facilityName,
                                                       LocalDateTime bookingStart, LocalDateTime bookingEnd) {
        // Find all students matching the criteria
        List<User> targetStudents = userRepository.findAll()
                .stream()
                .filter(u -> u.getRole() == User.UserRole.STUDENT)
                .filter(u -> u.getDepartment() != null && u.getDepartment().equalsIgnoreCase(department))
                .filter(u -> u.getStudentYear() != null && u.getStudentYear().equals(studentYear))
                .filter(u -> u.getStudentGroup() != null && u.getStudentGroup().equalsIgnoreCase(studentGroup))
                .collect(Collectors.toList());

        // Create notification for each student
        List<Notification> notifications = targetStudents.stream()
                .map(student -> new Notification(
                        student.getId(),
                        title,
                        message,
                        Notification.NotificationType.FACILITY_AVAILABLE,
                        bookingId,
                        "BOOKING"
                ))
                .collect(Collectors.toList());

        notificationRepository.saveAll(notifications);
    }

    @Transactional
    public void createBookingApprovalNotifications(String bookingId, String lecturerName, String facilityName,
                                                   String department, Integer year, String group,
                                                   LocalDateTime bookingStart, LocalDateTime bookingEnd) {
        String dateTime = String.format("%tF at %<tT", bookingStart);
        String endTime = String.format("%tT", bookingEnd);

        // Notify the lecturer
        String lecturerTitle = "✓ Booking Approved";
        String lecturerMessage = String.format("Your booking for %s on %s has been approved!", facilityName, dateTime);
        
        List<User> lecturers = userRepository.findAll()
                .stream()
                .filter(u -> u.getRole() == User.UserRole.LECTURER)
                .filter(u -> u.getFullName() != null && u.getFullName().contains(lecturerName))
                .collect(Collectors.toList());

        lecturers.forEach(lecturer -> createNotification(
                lecturer.getId(),
                lecturerTitle,
                lecturerMessage,
                Notification.NotificationType.BOOKING_APPROVED,
                bookingId,
                "BOOKING"
        ));

        // Notify the student group
        String studentTitle = String.format("📌 %s - %s", facilityName, department);
        String studentMessage = String.format(
                "Attention %s Year %d, Group %s:\n" +
                "Your lecture/lab has been scheduled.\n" +
                "📍 Facility: %s\n" +
                "📅 Date: %s\n" +
                "🕐 Time: %tT - %tT",
                department, year, group,
                facilityName,
                dateTime,
                bookingStart, bookingEnd
        );

        createBulkNotificationsForStudentGroup(department, year, group, studentTitle, studentMessage, bookingId, facilityName, bookingStart, bookingEnd);
    }

    private NotificationDTO convertToDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setUserId(notification.getUserId());
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setType(notification.getType());
        dto.setIsRead(notification.getIsRead());
        dto.setRelatedResourceId(notification.getRelatedResourceId());
        dto.setRelatedResourceType(notification.getRelatedResourceType());
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setReadAt(notification.getReadAt());
        return dto;
    }
}
