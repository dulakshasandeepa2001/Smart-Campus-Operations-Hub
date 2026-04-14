package com.smartcampus.backend.dto;

import lombok.NoArgsConstructor;

@NoArgsConstructor
public class FacilityDTO {
    private String id;
    private String name;
    private String description;
    private String type;
    private Integer capacity;
    private String location;
    private String building;
    private String floor;
    private String status;
    private String equipment;
    private String imageUrl;

    public FacilityDTO(String id, String name, String description, String type, Integer capacity, 
                      String location, String building, String floor, String status, String equipment, String imageUrl) {
        this.id = id;
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
    public String getType() { return type; }
    public Integer getCapacity() { return capacity; }
    public String getLocation() { return location; }
    public String getBuilding() { return building; }
    public String getFloor() { return floor; }
    public String getStatus() { return status; }
    public String getEquipment() { return equipment; }
    public String getImageUrl() { return imageUrl; }

    // Setters
    public void setId(String id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setDescription(String description) { this.description = description; }
    public void setType(String type) { this.type = type; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public void setLocation(String location) { this.location = location; }
    public void setBuilding(String building) { this.building = building; }
    public void setFloor(String floor) { this.floor = floor; }
    public void setStatus(String status) { this.status = status; }
    public void setEquipment(String equipment) { this.equipment = equipment; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    // Builder
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String name;
        private String description;
        private String type;
        private Integer capacity;
        private String location;
        private String building;
        private String floor;
        private String status;
        private String equipment;
        private String imageUrl;

        public Builder id(String id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder type(String type) { this.type = type; return this; }
        public Builder capacity(Integer capacity) { this.capacity = capacity; return this; }
        public Builder location(String location) { this.location = location; return this; }
        public Builder building(String building) { this.building = building; return this; }
        public Builder floor(String floor) { this.floor = floor; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder equipment(String equipment) { this.equipment = equipment; return this; }
        public Builder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }

        public FacilityDTO build() {
            return new FacilityDTO(id, name, description, type, capacity, location, building, floor, status, equipment, imageUrl);
        }
    }
}
