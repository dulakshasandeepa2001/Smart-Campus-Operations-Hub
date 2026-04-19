package com.smartcampus.backend.entity;

public enum FacilityStatus {
    ACTIVE("Active"),
    OUT_OF_SERVICE("Out of Service"),
    MAINTENANCE("Maintenance"),
    RETIRED("Retired");

    private final String displayName;

    FacilityStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
