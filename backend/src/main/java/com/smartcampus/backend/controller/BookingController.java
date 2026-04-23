package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.BookingDTO;
import com.smartcampus.backend.dto.CreateBookingRequest;
import com.smartcampus.backend.dto.UpdateBookingStatusRequest;
import com.smartcampus.backend.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bookings")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingDTO> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            @RequestHeader("X-User-Id") String userId) {
        BookingDTO booking = bookingService.createBooking(userId, request);
        return new ResponseEntity<>(booking, HttpStatus.CREATED);
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<BookingDTO> getBooking(@PathVariable String bookingId) {
        BookingDTO booking = bookingService.getBookingById(bookingId);
        return new ResponseEntity<>(booking, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookingDTO>> getUserBookings(@PathVariable String userId) {
        List<BookingDTO> bookings = bookingService.getUserBookings(userId);
        return new ResponseEntity<>(bookings, HttpStatus.OK);
    }

    @GetMapping("/facility/{facilityId}")
    public ResponseEntity<List<BookingDTO>> getFacilityBookings(@PathVariable String facilityId) {
        List<BookingDTO> bookings = bookingService.getFacilityBookings(facilityId);
        return new ResponseEntity<>(bookings, HttpStatus.OK);
    }

    @GetMapping("/admin/pending")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<BookingDTO>> getPendingBookings() {
        List<BookingDTO> bookings = bookingService.getPendingBookings();
        return new ResponseEntity<>(bookings, HttpStatus.OK);
    }

    @PutMapping("/{bookingId}")
    public ResponseEntity<BookingDTO> updateBooking(
            @PathVariable String bookingId,
            @Valid @RequestBody CreateBookingRequest request,
            @RequestHeader("X-User-Id") String userId) {
        BookingDTO booking = bookingService.updateBooking(userId, bookingId, request);
        return new ResponseEntity<>(booking, HttpStatus.OK);
    }

    @PutMapping("/{bookingId}/status")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<BookingDTO> updateBookingStatus(
            @PathVariable String bookingId,
            @Valid @RequestBody UpdateBookingStatusRequest request) {
        BookingDTO booking = bookingService.updateBookingStatus(bookingId, request);
        return new ResponseEntity<>(booking, HttpStatus.OK);
    }

    @PutMapping("/{bookingId}/cancel")
    public ResponseEntity<BookingDTO> cancelBooking(@PathVariable String bookingId) {
        BookingDTO booking = bookingService.cancelBooking(bookingId);
        return new ResponseEntity<>(booking, HttpStatus.OK);
    }
}
