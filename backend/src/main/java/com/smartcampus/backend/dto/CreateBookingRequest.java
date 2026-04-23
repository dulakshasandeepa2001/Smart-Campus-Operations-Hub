package com.smartcampus.backend.dto;

import java.time.LocalDateTime;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.util.List;

public class CreateBookingRequest {
    @NotBlank(message = "Facility ID is required")
    private String facilityId;

    @JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime bookingStart;  // Optional for seat bookings (students)

    @JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime bookingEnd;    // Optional for seat bookings (students)

    @NotBlank(message = "Purpose is required")
    private String purpose;

    private Integer expectedAttendees;   // For full facility bookings (lecturers)
    
    private Integer numberOfSeats;       // For seat bookings (students) - max 5
    
    private List<Integer> seatNumbers;   // Specific seat numbers booked by student
    
    private Boolean isFullFacility = false;  // Flag to indicate booking type

    private String facilityName;         // Add facility name
    private String subject;              // Subject or course name
    private String department;           // Department for student notifications
    private Integer studentYear;         // Year level to target (e.g., 1, 2)
    private String studentGroup;         // Group to target (e.g., "A", "1", etc.)

    public CreateBookingRequest() {}

    public CreateBookingRequest(String facilityId, LocalDateTime bookingStart, LocalDateTime bookingEnd,
                                String purpose, Integer expectedAttendees) {
        this.facilityId = facilityId;
        this.bookingStart = bookingStart;
        this.bookingEnd = bookingEnd;
        this.purpose = purpose;
        this.expectedAttendees = expectedAttendees;
        this.isFullFacility = true;
    }

    // Getters and Setters
    public String getFacilityId() { return facilityId; }
    public void setFacilityId(String facilityId) { this.facilityId = facilityId; }
    
    public LocalDateTime getBookingStart() { return bookingStart; }
    public void setBookingStart(LocalDateTime bookingStart) { this.bookingStart = bookingStart; }
    
    public LocalDateTime getBookingEnd() { return bookingEnd; }
    public void setBookingEnd(LocalDateTime bookingEnd) { this.bookingEnd = bookingEnd; }
    
    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }
    
    public Integer getExpectedAttendees() { return expectedAttendees; }
    public void setExpectedAttendees(Integer expectedAttendees) { this.expectedAttendees = expectedAttendees; }
    
    public Integer getNumberOfSeats() { return numberOfSeats; }
    public void setNumberOfSeats(Integer numberOfSeats) { this.numberOfSeats = numberOfSeats; }
    
    public List<Integer> getSeatNumbers() { return seatNumbers; }
    public void setSeatNumbers(List<Integer> seatNumbers) { this.seatNumbers = seatNumbers; }
    
    public Boolean getIsFullFacility() { return isFullFacility; }
    public void setIsFullFacility(Boolean isFullFacility) { this.isFullFacility = isFullFacility; }
    
    public String getFacilityName() { return facilityName; }
    public void setFacilityName(String facilityName) { this.facilityName = facilityName; }
    
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    
    public Integer getStudentYear() { return studentYear; }
    public void setStudentYear(Integer studentYear) { this.studentYear = studentYear; }
    
    public String getStudentGroup() { return studentGroup; }
    public void setStudentGroup(String studentGroup) { this.studentGroup = studentGroup; }
}
