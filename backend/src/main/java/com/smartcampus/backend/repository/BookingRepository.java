package com.smartcampus.backend.repository;

import com.smartcampus.backend.entity.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserIdOrderByBookingStartDesc(String userId);
    List<Booking> findByFacilityId(String facilityId);
    List<Booking> findByFacilityIdOrderByBookingStartAsc(String facilityId);
    List<Booking> findByStatusOrderByBookingStartDesc(Booking.BookingStatus status);
    List<Booking> findByFacilityIdAndStatusOrderByBookingStartAsc(String facilityId, Booking.BookingStatus status);
    
    @Query("{ 'facilityId': ?0, 'status': 'APPROVED', '$or': [" +
           "{ 'bookingStart': { '$lt': ?2 }, 'bookingEnd': { '$gt': ?1 } }" +
           "] }")
    List<Booking> findConflictingBookings(String facilityId, LocalDateTime start, LocalDateTime end);
}
