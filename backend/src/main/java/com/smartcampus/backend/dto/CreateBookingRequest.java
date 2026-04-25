package com.smartcampus.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonFormat;

public class CreateBookingRequest {

    @NotBlank(message = "Facility ID is required")
    private String facilityId;

    @NotNull(message = "Booking start is required")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime bookingStart;

    @NotNull(message = "Booking end is required")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime bookingEnd;

    @NotBlank(message = "Purpose is required")
    private String purpose;

    private Integer expectedAttendees;

    private Integer numberOfSeats;

    private List<Integer> seatNumbers;

    private Boolean isFullFacility = false;

    private String facilityName;

    private String subject;

    private String department;

    private Integer studentYear;

    private String studentGroup;

    public CreateBookingRequest() {}

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