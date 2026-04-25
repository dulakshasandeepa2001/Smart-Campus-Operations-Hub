package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.BookingDTO;
import com.smartcampus.backend.dto.CreateBookingRequest;
import com.smartcampus.backend.dto.UpdateBookingStatusRequest;
import com.smartcampus.backend.entity.Booking;
import com.smartcampus.backend.entity.Facility;
import com.smartcampus.backend.entity.User;
import com.smartcampus.backend.exception.BadRequestException;
import com.smartcampus.backend.exception.ResourceNotFoundException;
import com.smartcampus.backend.repository.BookingRepository;
import com.smartcampus.backend.repository.FacilityRepository;
import com.smartcampus.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private FacilityRepository facilityRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public BookingDTO createBooking(String userId, CreateBookingRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Facility facility = facilityRepository.findById(request.getFacilityId())
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found"));

        if (request.getBookingStart() == null || request.getBookingEnd() == null) {
            throw new BadRequestException("Booking start and end times are required");
        }

        if (!request.getBookingEnd().isAfter(request.getBookingStart())) {
            throw new BadRequestException("Booking end time must be after start time");
        }

        String role = user.getRole().name();

        if ("STUDENT".equals(role)) {
            validateStudentBooking(request, facility);
            validateSeatConflicts(request);
        } else if ("LECTURER".equals(role)) {
            validateLecturerBooking(request, facility);
        } else if (!"ADMIN".equals(role)) {
            throw new BadRequestException("Only students, lecturers, and admins can make bookings");
        }

        List<Booking> conflicts = bookingRepository.findApprovedConflictingBookings(
                request.getFacilityId(),
                request.getBookingStart(),
                request.getBookingEnd()
        );

        if (!conflicts.isEmpty()) {
            throw new BadRequestException("This resource is not available at the selected time period.");
        }

        Booking booking = new Booking();
        booking.setFacilityId(request.getFacilityId());
        booking.setUserId(userId);
        booking.setPurpose(request.getPurpose());
        booking.setBookingStart(request.getBookingStart());
        booking.setBookingEnd(request.getBookingEnd());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setNumberOfSeats(request.getNumberOfSeats());
        booking.setSeatNumbers(request.getSeatNumbers());
        booking.setStatus(Booking.BookingStatus.PENDING);
        booking.setFacilityName(request.getFacilityName() != null ? request.getFacilityName() : facility.getName());
        booking.setDepartment(request.getDepartment());
        booking.setStudentYear(request.getStudentYear());
        booking.setStudentGroup(request.getStudentGroup());
        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());

        Booking savedBooking = bookingRepository.save(booking);
        return convertToDTO(savedBooking, booking.getFacilityName());
    }

    private void validateStudentBooking(CreateBookingRequest request, Facility facility) {
        if (!isStudentBookingAllowed(facility.getType())) {
            throw new BadRequestException("Students can only book Lecture Halls or Labs");
        }

        if (request.getNumberOfSeats() == null || request.getNumberOfSeats() < 1 || request.getNumberOfSeats() > 5) {
            throw new BadRequestException("Students can only book 1 to 5 seats");
        }

        if (request.getSeatNumbers() == null || request.getSeatNumbers().isEmpty()) {
            throw new BadRequestException("Seat numbers are required");
        }

        if (request.getSeatNumbers().size() != request.getNumberOfSeats()) {
            throw new BadRequestException("Seat count mismatch");
        }

        long unique = request.getSeatNumbers().stream().distinct().count();
        if (unique != request.getSeatNumbers().size()) {
            throw new BadRequestException("Duplicate seats not allowed");
        }

        for (Integer seat : request.getSeatNumbers()) {
            if (seat == null || seat < 1 || seat > facility.getCapacity()) {
                throw new BadRequestException("Invalid seat number");
            }
        }
    }

    private void validateSeatConflicts(CreateBookingRequest request) {
        List<Booking> conflicts = bookingRepository.findSeatConflicts(
                request.getFacilityId(),
                request.getBookingStart(),
                request.getBookingEnd(),
                request.getSeatNumbers()
        );

        if (!conflicts.isEmpty()) {
            throw new BadRequestException("Selected seats already booked for this time");
        }
    }

    private void validateLecturerBooking(CreateBookingRequest request, Facility facility) {
        if (request.getExpectedAttendees() == null || request.getExpectedAttendees() < 1) {
            throw new BadRequestException("Expected attendees required");
        }

        boolean isFull = request.getExpectedAttendees() >= Math.ceil(facility.getCapacity() * 0.8);

        if (isFull && !isLecturerFullFacilityAllowed(facility.getType())) {
            throw new BadRequestException("Invalid facility type for full booking");
        }
    }

    private boolean isStudentBookingAllowed(Facility.FacilityType type) {
        return type == Facility.FacilityType.LECTURE_HALL ||
               type == Facility.FacilityType.LAB ||
               type == Facility.FacilityType.MEETING_ROOM;
    }

    private boolean isLecturerFullFacilityAllowed(Facility.FacilityType type) {
        return type == Facility.FacilityType.LECTURE_HALL ||
               type == Facility.FacilityType.LAB;
    }

    public BookingDTO getBookingById(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        Facility facility = facilityRepository.findById(booking.getFacilityId()).orElse(null);
        String facilityName = facility != null ? facility.getName() : "Unknown";
        return convertToDTO(booking, facilityName);
    }

    @Transactional
    public BookingDTO updateBooking(String userId, String bookingId, CreateBookingRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        User requester = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!booking.getUserId().equals(userId) && !isAdmin(requester)) {
            throw new BadRequestException("You can only edit your own booking requests");
        }

        if (!booking.getStatus().equals(Booking.BookingStatus.PENDING)) {
            throw new BadRequestException("Only pending bookings can be edited");
        }

        Facility facility = facilityRepository.findById(request.getFacilityId())
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found"));

        if (request.getBookingStart() == null || request.getBookingEnd() == null) {
            throw new BadRequestException("Booking start and end times are required");
        }

        if (!request.getBookingEnd().isAfter(request.getBookingStart())) {
            throw new BadRequestException("Booking end time must be after start time");
        }

        boolean isFullFacilityBooking = request.getExpectedAttendees() != null &&
                request.getExpectedAttendees() >= Math.ceil(facility.getCapacity() * 0.8);

        if (isFullFacilityBooking && !isLecturerFullFacilityAllowed(facility.getType())) {
            throw new BadRequestException("Invalid facility type for full booking");
        }

        List<Booking> approvedConflicts = bookingRepository.findApprovedConflictingBookingsExcluding(
                request.getFacilityId(),
                request.getBookingStart(),
                request.getBookingEnd(),
                bookingId
        );

        if (!approvedConflicts.isEmpty()) {
            throw new BadRequestException("This resource is not available at the selected time period.");
        }

        booking.setFacilityId(request.getFacilityId());
        booking.setFacilityName(request.getFacilityName() != null ? request.getFacilityName() : facility.getName());
        booking.setBookingStart(request.getBookingStart());
        booking.setBookingEnd(request.getBookingEnd());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setPurpose(request.getPurpose());
        booking.setSubject(request.getSubject());
        booking.setUpdatedAt(LocalDateTime.now());

        Booking updatedBooking = bookingRepository.save(booking);
        return convertToDTO(updatedBooking, booking.getFacilityName());
    }

    public List<BookingDTO> getUserBookings(String userId) {
        return bookingRepository.findByUserIdOrderByBookingStartDesc(userId)
                .stream()
                .map(booking -> {
                    Facility facility = facilityRepository.findById(booking.getFacilityId()).orElse(null);
                    String facilityName = facility != null ? facility.getName() : "Unknown";
                    return convertToDTO(booking, facilityName);
                })
                .collect(Collectors.toList());
    }

    public List<BookingDTO> getPendingBookings() {
        return bookingRepository.findByStatusOrderByBookingStartDesc(Booking.BookingStatus.PENDING)
                .stream()
                .map(booking -> {
                    Facility facility = facilityRepository.findById(booking.getFacilityId()).orElse(null);
                    String facilityName = facility != null ? facility.getName() : "Unknown";
                    return convertToDTO(booking, facilityName);
                })
                .collect(Collectors.toList());
    }

    public List<BookingDTO> getFacilityBookings(String facilityId) {
        return bookingRepository.findByFacilityIdOrderByBookingStartAsc(facilityId)
                .stream()
                .map(booking -> convertToDTO(booking, null))
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingDTO updateBookingStatus(String bookingId, UpdateBookingStatusRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (request.getStatus() == Booking.BookingStatus.APPROVED
                && booking.getBookingStart() != null
                && booking.getBookingEnd() != null) {
            List<Booking> approvedConflicts = bookingRepository.findApprovedConflictingBookingsExcluding(
                    booking.getFacilityId(),
                    booking.getBookingStart(),
                    booking.getBookingEnd(),
                    bookingId
            );
            if (!approvedConflicts.isEmpty()) {
                throw new BadRequestException("This resource is not available at the selected time period.");
            }
        }

        booking.setStatus(request.getStatus());
        if (request.getRejectionReason() != null) {
            booking.setRejectionReason(request.getRejectionReason());
        }
        booking.setUpdatedAt(LocalDateTime.now());

        Booking updatedBooking = bookingRepository.save(booking);

        if (request.getStatus() == Booking.BookingStatus.APPROVED) {
            User lecturer = userRepository.findById(booking.getUserId()).orElse(null);
            String lecturerName = lecturer != null ? lecturer.getFullName() : "Lecturer";

            notificationService.createNotification(
                    booking.getUserId(),
                    "✓ Booking Approved",
                    String.format("Your booking for %s on %tF at %<tT has been approved!",
                            booking.getFacilityName(), booking.getBookingStart()),
                    com.smartcampus.backend.entity.Notification.NotificationType.BOOKING_APPROVED,
                    bookingId,
                    "BOOKING"
            );

            if (booking.getDepartment() != null && booking.getStudentYear() != null && booking.getStudentGroup() != null) {
                notificationService.createBookingApprovalNotifications(
                        bookingId,
                        lecturerName,
                        booking.getFacilityName(),
                        booking.getDepartment(),
                        booking.getStudentYear(),
                        booking.getStudentGroup(),
                        booking.getBookingStart(),
                        booking.getBookingEnd()
                );
            }
        } else if (request.getStatus() == Booking.BookingStatus.REJECTED) {
            notificationService.createNotification(
                    booking.getUserId(),
                    "❌ Booking Rejected",
                    "Your booking has been rejected. Reason: " + request.getRejectionReason(),
                    com.smartcampus.backend.entity.Notification.NotificationType.BOOKING_REJECTED,
                    bookingId,
                    "BOOKING"
            );
        }

        Facility facility = facilityRepository.findById(booking.getFacilityId()).orElse(null);
        String facilityName = facility != null ? facility.getName() : "Unknown";
        return convertToDTO(updatedBooking, facilityName);
    }

    @Transactional
    public BookingDTO cancelBooking(String userId, String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        User requester = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!booking.getUserId().equals(userId) && !isAdmin(requester)) {
            throw new BadRequestException("You can only cancel your own booking requests");
        }

        if (!booking.getStatus().equals(Booking.BookingStatus.APPROVED)) {
            throw new BadRequestException("Only approved bookings can be cancelled");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setUpdatedAt(LocalDateTime.now());

        Booking updatedBooking = bookingRepository.save(booking);

        notificationService.createNotification(
                booking.getUserId(),
                "Booking Cancelled",
                "Your booking has been cancelled",
                com.smartcampus.backend.entity.Notification.NotificationType.BOOKING_CANCELLED,
                bookingId,
                "BOOKING"
        );

        Facility facility = facilityRepository.findById(booking.getFacilityId()).orElse(null);
        String facilityName = facility != null ? facility.getName() : "Unknown";
        return convertToDTO(updatedBooking, facilityName);
    }

    @Transactional
    public void deleteBooking(String userId, String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        User requester = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!booking.getUserId().equals(userId) && !isAdmin(requester)) {
            throw new BadRequestException("You can only delete your own booking requests");
        }

        if (!booking.getStatus().equals(Booking.BookingStatus.PENDING)) {
            throw new BadRequestException("Only pending bookings can be deleted");
        }

        bookingRepository.deleteById(bookingId);
    }

    private boolean isAdmin(User user) {
        return user != null
                && user.getRole() != null
                && "ADMIN".equals(user.getRole().name());
    }

    private BookingDTO convertToDTO(Booking booking, String facilityName) {
        BookingDTO dto = new BookingDTO();
        dto.setId(booking.getId());
        dto.setFacilityId(booking.getFacilityId());
        dto.setUserId(booking.getUserId());
        dto.setBookingStart(booking.getBookingStart());
        dto.setBookingEnd(booking.getBookingEnd());
        dto.setStatus(booking.getStatus());
        dto.setPurpose(booking.getPurpose());
        dto.setExpectedAttendees(booking.getExpectedAttendees());
        dto.setSubject(booking.getSubject());
        dto.setNumberOfSeats(booking.getNumberOfSeats());
        dto.setSeatNumbers(booking.getSeatNumbers());
        dto.setRejectionReason(booking.getRejectionReason());
        dto.setCreatedAt(booking.getCreatedAt());
        dto.setFacilityName(facilityName);
        return dto;
    }
}