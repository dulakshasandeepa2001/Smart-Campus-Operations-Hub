package com.smartcampus.backend.dto;

import com.smartcampus.backend.entity.Booking.BookingStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateBookingStatusRequest {
    @NotNull(message = "Status is required")
    private BookingStatus status;
    
    private String rejectionReason;

    public UpdateBookingStatusRequest() {}

    public UpdateBookingStatusRequest(BookingStatus status, String rejectionReason) {
        this.status = status;
        this.rejectionReason = rejectionReason;
    }

    // Getters and Setters
    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }
    
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}
