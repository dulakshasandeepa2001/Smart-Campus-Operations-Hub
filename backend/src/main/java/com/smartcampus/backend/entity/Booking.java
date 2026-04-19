package com.smartcampus.backend.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "bookings")
public class Booking {

    @Id
    private String id;
    private String facilityId;
    private String facilityName;  // Store facility name for notifications
    private String userId;
    private LocalDateTime bookingStart;
    private LocalDateTime bookingEnd;
    private BookingStatus status;
    private String purpose;
    private Integer expectedAttendees;
    private Integer numberOfSeats;  // For student seat bookings
    private List<Integer> seatNumbers;  // Specific seat numbers booked by student
    private String rejectionReason;
    private String department;  // Department of lecturer's course
    private Integer studentYear;  // Year level (1, 2, 3, 4)
    private String studentGroup;  // Group identifier (1, 2, 3, etc.)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Booking() {}

    public Booking(String facilityId, String userId, LocalDateTime bookingStart, LocalDateTime bookingEnd,
                   String purpose, Integer expectedAttendees) {
        this.facilityId = facilityId;
        this.userId = userId;
        this.bookingStart = bookingStart;
        this.bookingEnd = bookingEnd;
        this.purpose = purpose;
        this.expectedAttendees = expectedAttendees;
        this.status = BookingStatus.PENDING;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public enum BookingStatus {
        PENDING("Pending"),
        APPROVED("Approved"),
        REJECTED("Rejected"),
        CANCELLED("Cancelled");

        private final String displayName;

        BookingStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    // Getters
    public String getId() { return id; }
    public String getFacilityId() { return facilityId; }
    public String getFacilityName() { return facilityName; }
    public String getUserId() { return userId; }
    public LocalDateTime getBookingStart() { return bookingStart; }
    public LocalDateTime getBookingEnd() { return bookingEnd; }
    public BookingStatus getStatus() { return status; }
    public String getPurpose() { return purpose; }
    public Integer getExpectedAttendees() { return expectedAttendees; }
    public Integer getNumberOfSeats() { return numberOfSeats; }
    public List<Integer> getSeatNumbers() { return seatNumbers; }
    public String getRejectionReason() { return rejectionReason; }
    public String getDepartment() { return department; }
    public Integer getStudentYear() { return studentYear; }
    public String getStudentGroup() { return studentGroup; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    // Setters
    public void setId(String id) { this.id = id; }
    public void setFacilityId(String facilityId) { this.facilityId = facilityId; }
    public void setFacilityName(String facilityName) { this.facilityName = facilityName; }
    public void setUserId(String userId) { this.userId = userId; }
    public void setBookingStart(LocalDateTime bookingStart) { this.bookingStart = bookingStart; }
    public void setBookingEnd(LocalDateTime bookingEnd) { this.bookingEnd = bookingEnd; }
    public void setStatus(BookingStatus status) { this.status = status; }
    public void setPurpose(String purpose) { this.purpose = purpose; }
    public void setExpectedAttendees(Integer expectedAttendees) { this.expectedAttendees = expectedAttendees; }
    public void setNumberOfSeats(Integer numberOfSeats) { this.numberOfSeats = numberOfSeats; }
    public void setSeatNumbers(List<Integer> seatNumbers) { this.seatNumbers = seatNumbers; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public void setDepartment(String department) { this.department = department; }
    public void setStudentYear(Integer studentYear) { this.studentYear = studentYear; }
    public void setStudentGroup(String studentGroup) { this.studentGroup = studentGroup; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
