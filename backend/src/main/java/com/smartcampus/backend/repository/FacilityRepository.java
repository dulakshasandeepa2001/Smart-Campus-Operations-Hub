package com.smartcampus.backend.repository;

import com.smartcampus.backend.entity.Facility;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FacilityRepository extends MongoRepository<Facility, String> {
    List<Facility> findByStatus(Facility.FacilityStatus status);
    
    List<Facility> findByType(Facility.FacilityType type);
    
    @Query("{ $or: [ { 'name': { $regex: ?0, $options: 'i' } }, { 'location': { $regex: ?0, $options: 'i' } }, { 'building': { $regex: ?0, $options: 'i' } } ] }")
    List<Facility> searchFacilities(String keyword);
    
    List<Facility> findByCapacityGreaterThanEqual(Integer capacity);
    
    List<Facility> findByTypeAndStatus(Facility.FacilityType type, Facility.FacilityStatus status);
}
