package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.FacilityDTO;
import com.smartcampus.backend.entity.Facility;
import com.smartcampus.backend.exception.BadRequestException;
import com.smartcampus.backend.exception.ResourceNotFoundException;
import com.smartcampus.backend.repository.FacilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FacilityService {

    @Autowired
    private FacilityRepository facilityRepository;

    public List<FacilityDTO> getAllFacilities() {
        return facilityRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public FacilityDTO getFacilityById(String id) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with id: " + id));
        return convertToDTO(facility);
    }

    public List<FacilityDTO> searchFacilities(String keyword) {
        return facilityRepository.searchFacilities(keyword)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<FacilityDTO> getFacilitiesByType(String type) {
        try {
            Facility.FacilityType facilityType = Facility.FacilityType.valueOf(type.toUpperCase());
            return facilityRepository.findByType(facilityType)
                    .stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid facility type: " + type);
        }
    }

    public List<FacilityDTO> getFacilitiesByStatus(String status) {
        try {
            Facility.FacilityStatus facilityStatus = Facility.FacilityStatus.valueOf(status.toUpperCase());
            return facilityRepository.findByStatus(facilityStatus)
                    .stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid facility status: " + status);
        }
    }

    public List<FacilityDTO> getFacilitiesByCapacity(Integer capacity) {
        if (capacity <= 0) {
            throw new BadRequestException("Capacity must be greater than 0");
        }
        return facilityRepository.findByCapacityGreaterThanEqual(capacity)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public FacilityDTO createFacility(FacilityDTO facilityDTO) {
        if (facilityDTO.getName() == null || facilityDTO.getName().isEmpty()) {
            throw new BadRequestException("Facility name is required");
        }

        try {
            Facility.FacilityType type = Facility.FacilityType.valueOf(facilityDTO.getType().toUpperCase());
            Facility.FacilityStatus status = Facility.FacilityStatus.valueOf(
                    facilityDTO.getStatus() != null ? facilityDTO.getStatus() : "ACTIVE"
            );

            Facility facility = Facility.builder()
                    .name(facilityDTO.getName())
                    .description(facilityDTO.getDescription())
                    .type(type)
                    .capacity(facilityDTO.getCapacity())
                    .location(facilityDTO.getLocation())
                    .building(facilityDTO.getBuilding())
                    .floor(facilityDTO.getFloor())
                    .status(status)
                    .equipment(facilityDTO.getEquipment())
                    .imageUrl(facilityDTO.getImageUrl())
                    .build();

            Facility savedFacility = facilityRepository.save(facility);
            return convertToDTO(savedFacility);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid facility type or status");
        }
    }

    @Transactional
    public FacilityDTO updateFacility(String id, FacilityDTO facilityDTO) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with id: " + id));

        if (facilityDTO.getName() != null && !facilityDTO.getName().isEmpty()) {
            facility.setName(facilityDTO.getName());
        }
        if (facilityDTO.getDescription() != null) {
            facility.setDescription(facilityDTO.getDescription());
        }
        if (facilityDTO.getType() != null) {
            facility.setType(Facility.FacilityType.valueOf(facilityDTO.getType().toUpperCase()));
        }
        if (facilityDTO.getCapacity() != null) {
            facility.setCapacity(facilityDTO.getCapacity());
        }
        if (facilityDTO.getLocation() != null) {
            facility.setLocation(facilityDTO.getLocation());
        }
        if (facilityDTO.getBuilding() != null) {
            facility.setBuilding(facilityDTO.getBuilding());
        }
        if (facilityDTO.getFloor() != null) {
            facility.setFloor(facilityDTO.getFloor());
        }
        if (facilityDTO.getStatus() != null) {
            facility.setStatus(Facility.FacilityStatus.valueOf(facilityDTO.getStatus().toUpperCase()));
        }
        if (facilityDTO.getEquipment() != null) {
            facility.setEquipment(facilityDTO.getEquipment());
        }
        if (facilityDTO.getImageUrl() != null) {
            facility.setImageUrl(facilityDTO.getImageUrl());
        }

        Facility updatedFacility = facilityRepository.save(facility);
        return convertToDTO(updatedFacility);
    }

    @Transactional
    public void deleteFacility(String id) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with id: " + id));
        facilityRepository.delete(facility);
    }

    public List<FacilityDTO> getActiveFacilities() {
        return facilityRepository.findByStatus(Facility.FacilityStatus.ACTIVE)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private FacilityDTO convertToDTO(Facility facility) {
        return FacilityDTO.builder()
                .id(facility.getId())
                .name(facility.getName())
                .description(facility.getDescription())
                .type(facility.getType().name())
                .capacity(facility.getCapacity())
                .location(facility.getLocation())
                .building(facility.getBuilding())
                .floor(facility.getFloor())
                .status(facility.getStatus().name())
                .equipment(facility.getEquipment())
                .imageUrl(facility.getImageUrl())
                .build();
    }
}
