package com.smartcampus.backend.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "facilities")
public class Facility {

    @Id
    private String id;
    private String name;
    private String description;
    private FacilityType type;
    private Integer capacity;
    private String location;
    private String building;
    private String floor;
    private FacilityStatus status;
    private String equipment;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Facility() {}

    public Facility(String name, String description, FacilityType type, Integer capacity, String location, 
                   String building, String floor, FacilityStatus status, String equipment, String imageUrl) {
        this.name = name;
        this.description = description;
        this.type = type;
        this.capacity = capacity;
        this.location = location;
        this.building = building;
        this.floor = floor;
        this.status = status;
        this.equipment = equipment;
        this.imageUrl = imageUrl;
    }

    // Getters
    public String getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public FacilityType getType() { return type; }
    public Integer getCapacity() { return capacity; }
    public String getLocation() { return location; }
    public String getBuilding() { return building; }
    public String getFloor() { return floor; }
    public FacilityStatus getStatus() { return status; }
    public String getEquipment() { return equipment; }
    public String getImageUrl() { return imageUrl; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    // Setters
    public void setId(String id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setDescription(String description) { this.description = description; }
    public void setType(FacilityType type) { this.type = type; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public void setLocation(String location) { this.location = location; }
    public void setBuilding(String building) { this.building = building; }
    public void setFloor(String floor) { this.floor = floor; }
    public void setStatus(FacilityStatus status) { this.status = status; }
    public void setEquipment(String equipment) { this.equipment = equipment; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Builder
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String name;
        private String description;
        private FacilityType type;
        private Integer capacity;
        private String location;
        private String building;
        private String floor;
        private FacilityStatus status;
        private String equipment;
        private String imageUrl;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Builder id(String id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder type(FacilityType type) { this.type = type; return this; }
        public Builder capacity(Integer capacity) { this.capacity = capacity; return this; }
        public Builder location(String location) { this.location = location; return this; }
        public Builder building(String building) { this.building = building; return this; }
        public Builder floor(String floor) { this.floor = floor; return this; }
        public Builder status(FacilityStatus status) { this.status = status; return this; }
        public Builder equipment(String equipment) { this.equipment = equipment; return this; }
        public Builder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Facility build() {
            Facility facility = new Facility(name, description, type, capacity, location, building, floor, status, equipment, imageUrl);
            facility.setId(id);
            facility.setCreatedAt(createdAt);
            facility.setUpdatedAt(updatedAt);
            return facility;
        }
    }

    public enum FacilityType {
        LECTURE_HALL, LABORATORY, MEETING_ROOM, AUDITORIUM, EQUIPMENT, STUDY_AREA
    }

    public enum FacilityStatus {
        ACTIVE, OUT_OF_SERVICE, MAINTENANCE, INACTIVE
    }
}
