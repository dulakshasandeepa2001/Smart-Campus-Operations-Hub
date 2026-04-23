package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.FacilityDTO;
import com.smartcampus.backend.service.FacilityService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/facilities")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class FacilityController {

    @Autowired
    private FacilityService facilityService;

    @GetMapping
    public ResponseEntity<List<FacilityDTO>> getAllFacilities() {
        List<FacilityDTO> facilities = facilityService.getAllFacilities();
        return new ResponseEntity<>(facilities, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FacilityDTO> getFacilityById(@PathVariable String id) {
        FacilityDTO facility = facilityService.getFacilityById(id);
        return new ResponseEntity<>(facility, HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<List<FacilityDTO>> searchFacilities(@RequestParam String keyword) {
        List<FacilityDTO> facilities = facilityService.searchFacilities(keyword);
        return new ResponseEntity<>(facilities, HttpStatus.OK);
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<FacilityDTO>> getFacilitiesByType(@PathVariable String type) {
        List<FacilityDTO> facilities = facilityService.getFacilitiesByType(type);
        return new ResponseEntity<>(facilities, HttpStatus.OK);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<FacilityDTO>> getFacilitiesByStatus(@PathVariable String status) {
        List<FacilityDTO> facilities = facilityService.getFacilitiesByStatus(status);
        return new ResponseEntity<>(facilities, HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<FacilityDTO> createFacility(@Valid @RequestBody FacilityDTO facilityDTO) {
        FacilityDTO facility = facilityService.createFacility(facilityDTO);
        return new ResponseEntity<>(facility, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<FacilityDTO> updateFacility(@PathVariable String id, @Valid @RequestBody FacilityDTO facilityDTO) {
        FacilityDTO facility = facilityService.updateFacility(id, facilityDTO);
        return new ResponseEntity<>(facility, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteFacility(@PathVariable String id) {
        facilityService.deleteFacility(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Facility deleted successfully");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/active/list")
    public ResponseEntity<List<FacilityDTO>> getActiveFacilities() {
        List<FacilityDTO> facilities = facilityService.getActiveFacilities();
        return new ResponseEntity<>(facilities, HttpStatus.OK);
    }

    @GetMapping("/capacity/{capacity}")
    public ResponseEntity<List<FacilityDTO>> getFacilitiesByCapacity(@PathVariable Integer capacity) {
        List<FacilityDTO> facilities = facilityService.getFacilitiesByCapacity(capacity);
        return new ResponseEntity<>(facilities, HttpStatus.OK);
    }
}
