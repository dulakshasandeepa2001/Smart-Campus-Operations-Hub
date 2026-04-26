package com.smartcampus.backend.entity;

public enum TicketStatus {
    OPEN("Open"),
    IN_PROGRESS("In Progress"),
    ON_HOLD("On Hold"),
    RESOLVED("Resolved"),
    CLOSED("Closed"),
    REOPENED("Reopened");
    
    private final String displayName;
    
    TicketStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
