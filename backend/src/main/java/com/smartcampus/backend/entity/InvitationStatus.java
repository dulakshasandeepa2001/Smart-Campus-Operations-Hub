package com.smartcampus.backend.entity;

public enum InvitationStatus {
    PENDING("Pending"),
    ACCEPTED("Accepted"),
    EXPIRED("Expired"),
    REJECTED("Rejected");

    private final String displayName;

    InvitationStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
