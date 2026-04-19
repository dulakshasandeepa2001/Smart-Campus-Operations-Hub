package com.smartcampus.backend.entity;

public enum UserRole {
    ADMIN("Admin"),
    LECTURER("Lecturer"),
    TECHNICIAN("Technician"),
    STUDENT("Student");

    private final String displayName;

    UserRole(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
