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
        // Get user to check role
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Validate facility exists and is active
        Facility facility = facilityRepository.findById(request.getFacilityId())
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found"));

        // ROLE-BASED BOOKING AUTHORIZATION
        boolean isStudentSeatBooking = "STUDENT".equals(user.getRole().name());
        
        if ("STUDENT".equals(user.getRole().name())) {
            // Students can ONLY book individual seats, not full facilities
            if (request.getNumberOfSeats() == null || request.getNumberOfSeats() > 5) {
                throw new BadRequestException(
                    "❌ Students can only book up to 5 individual seats."
                );
            }
            
            // Students can only book lecture halls or labs (for individual seats)
            if (!isStudentBookingAllowed(facility.getType())) {
                throw new BadRequestException(
                    "❌ Students can only book seats in Lecture Halls or Labs, not " + facility.getType()
                );
            }
            
            // Validate seat numbers if provided
            if (request.getSeatNumbers() != null && !request.getSeatNumbers().isEmpty()) {
                List<Integer> seatNumbers = request.getSeatNumbers();
                
                // Check seat numbers are valid
                for (Integer seatNum : seatNumbers) {
                    if (seatNum == null || seatNum < 1 || seatNum > facility.getCapacity()) {
                        throw new BadRequestException(
                            "❌ Invalid seat number. Facility has seats 1-" + facility.getCapacity()
                        );
                    }
                }
                
                // Check for seat conflicts
                List<Integer> bookedSeats = getBookedSeatsForFacility(request.getFacilityId());
                for (Integer seatNum : seatNumbers) {
                    if (bookedSeats.contains(seatNum)) {
                        throw new BadRequestException(
                            "❌ Seat " + seatNum + " is already booked"
                        );
                    }
                }
            }
        } else if ("LECTURER".equals(user.getRole().name())) {
            // Lecturers MUST provide dates for full facility bookings
            if (request.getBookingStart() == null || request.getBookingEnd() == null) {
                throw new BadRequestException("Lecturers must specify booking start and end times");
            }
            
            // Check if trying to book as full facility
            boolean isFullFacilityBooking = request.getExpectedAttendees() != null && 
                                           request.getExpectedAttendees() > (facility.getCapacity() / 2);
            
            if (isFullFacilityBooking) {
                // Full facility booking - only lecture halls and labs allowed
                if (!isLecturerFullFacilityAllowed(facility.getType())) {
                    throw new BadRequestException(
                        "❌ Lecturers can only book full Lecture Halls and Labs, not " + facility.getType()
                    );
                }
            }
            
            // Check for time conflicts
            List<Booking> conflicts = bookingRepository.findConflictingBookings(
                    request.getFacilityId(),
                    request.getBookingStart(),
                    request.getBookingEnd()
            );

            if (!conflicts.isEmpty()) {
                throw new BadRequestException("This facility has a conflict with existing bookings during the selected time");
            }

            // Validate booking end is after start
            if (request.getBookingEnd().isBefore(request.getBookingStart())) {
                throw new BadRequestException("Booking end time must be after start time");
            }
        } else if (!"ADMIN".equals(user.getRole().name())) {
            throw new BadRequestException("Only students, lecturers, and admins can make bookings");
        }

        // Create booking
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

    /**
     * Check if facility type is allowed for student seat bookings
     */
    private boolean isStudentBookingAllowed(Facility.FacilityType type) {
        return type == Facility.FacilityType.LECTURE_HALL ||
               type == Facility.FacilityType.LAB ||
               type == Facility.FacilityType.MEETING_ROOM;
    }

    /**
     * Check if facility type is allowed for lecturer full facility bookings
     */
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

        if (!booking.getUserId().equals(userId)) {
            throw new BadRequestException("You can only edit your own booking requests");
        }

        if (!booking.getStatus().equals(Booking.BookingStatus.PENDING)) {
            throw new BadRequestException("Only pending bookings can be edited");
        }

        Facility facility = facilityRepository.findById(request.getFacilityId())
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found"));

        if (request.getBookingStart() == null || request.getBookingEnd() == null) {
            throw new BadRequestException("Lecturers must specify booking start and end times");
        }

        if (request.getBookingEnd().isBefore(request.getBookingStart())) {
            throw new BadRequestException("Booking end time must be after start time");
        }

        boolean isFullFacilityBooking = request.getExpectedAttendees() != null &&
                                       request.getExpectedAttendees() > (facility.getCapacity() / 2);

        if (isFullFacilityBooking && !isLecturerFullFacilityAllowed(facility.getType())) {
            throw new BadRequestException(
                    "❌ Lecturers can only book full Lecture Halls and Labs, not " + facility.getType()
            );
        }

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                request.getFacilityId(),
                request.getBookingStart(),
                request.getBookingEnd()
        ).stream()
          .filter(conflict -> !conflict.getId().equals(bookingId))
          .collect(Collectors.toList());

        if (!conflicts.isEmpty()) {
            throw new BadRequestException("This facility has a conflict with existing bookings during the selected time");
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

        booking.setStatus(request.getStatus());
        if (request.getRejectionReason() != null) {
            booking.setRejectionReason(request.getRejectionReason());
        }
        booking.setUpdatedAt(LocalDateTime.now());

        Booking updatedBooking = bookingRepository.save(booking);

        // Send notification
        String title = "";
        String message = "";
        if (request.getStatus() == Booking.BookingStatus.APPROVED) {
            title = "✓ Booking Approved";
            message = "Your booking has been approved";
            
            // Get lecturer name for notifications
            User lecturer = userRepository.findById(booking.getUserId()).orElse(null);
            String lecturerName = lecturer != null ? lecturer.getFullName() : "Lecturer";
            
            // Notify lecturer about approval
            notificationService.createNotification(
                    booking.getUserId(),
                    title,
                    String.format("Your booking for %s on %tF at %<tT has been approved!",
                            booking.getFacilityName(), booking.getBookingStart()),
                    com.smartcampus.backend.entity.Notification.NotificationType.BOOKING_APPROVED,
                    bookingId,
                    "BOOKING"
            );
            
            // Create bulk notifications for target student group if details are available
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
            title = "❌ Booking Rejected";
            message = "Your booking has been rejected. Reason: " + request.getRejectionReason();
            
            notificationService.createNotification(
                    booking.getUserId(),
                    title,
                    message,
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
    public BookingDTO cancelBooking(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getStatus().equals(Booking.BookingStatus.APPROVED)) {
            throw new BadRequestException("Only approved bookings can be cancelled");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setUpdatedAt(LocalDateTime.now());

        Booking updatedBooking = bookingRepository.save(booking);

        // Send notification
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

    /**
     * Get all booked seat numbers for a facility (from APPROVED and PENDING bookings)
     */
    private List<Integer> getBookedSeatsForFacility(String facilityId) {
        return bookingRepository.findByFacilityId(facilityId)
                .stream()
                .filter(booking -> booking.getStatus() == Booking.BookingStatus.APPROVED || 
                                 booking.getStatus() == Booking.BookingStatus.PENDING)
                .filter(booking -> booking.getSeatNumbers() != null)
                .flatMap(booking -> booking.getSeatNumbers().stream())
                .collect(Collectors.toList());
    }
}
