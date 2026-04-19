package com.smartcampus.backend.dto;

import com.smartcampus.backend.entity.Booking.BookingStatus;
import java.time.LocalDateTime;
import java.util.List;

public class BookingDTO {
    private String id;
    private String facilityId;
    private String userId;
    private LocalDateTime bookingStart;
    private LocalDateTime bookingEnd;
    private BookingStatus status;
    private String purpose;
    private Integer expectedAttendees;
    private Integer numberOfSeats;
    private List<Integer> seatNumbers;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private String facilityName;

    public BookingDTO() {}

    public BookingDTO(String id, String facilityId, String userId, LocalDateTime bookingStart,
                      LocalDateTime bookingEnd, BookingStatus status, String purpose, 
                      Integer expectedAttendees, LocalDateTime createdAt) {
        this.id = id;
        this.facilityId = facilityId;
        this.userId = userId;
        this.bookingStart = bookingStart;
        this.bookingEnd = bookingEnd;
        this.status = status;
        this.purpose = purpose;
        this.expectedAttendees = expectedAttendees;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getFacilityId() { return facilityId; }
    public void setFacilityId(String facilityId) { this.facilityId = facilityId; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public LocalDateTime getBookingStart() { return bookingStart; }
    public void setBookingStart(LocalDateTime bookingStart) { this.bookingStart = bookingStart; }
    
    public LocalDateTime getBookingEnd() { return bookingEnd; }
    public void setBookingEnd(LocalDateTime bookingEnd) { this.bookingEnd = bookingEnd; }
    
    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }
    
    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }
    
    public Integer getExpectedAttendees() { return expectedAttendees; }
    public void setExpectedAttendees(Integer expectedAttendees) { this.expectedAttendees = expectedAttendees; }
    
    public Integer getNumberOfSeats() { return numberOfSeats; }
    public void setNumberOfSeats(Integer numberOfSeats) { this.numberOfSeats = numberOfSeats; }
    
    public List<Integer> getSeatNumbers() { return seatNumbers; }
    public void setSeatNumbers(List<Integer> seatNumbers) { this.seatNumbers = seatNumbers; }
    
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public String getFacilityName() { return facilityName; }
    public void setFacilityName(String facilityName) { this.facilityName = facilityName; }
}
