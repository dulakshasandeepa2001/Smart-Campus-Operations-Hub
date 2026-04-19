package com.smartcampus.backend.entity;

public enum FacilityType {
    LECTURE_HALL("Lecture Hall"),
    LABORATORY("Laboratory"),
    MEETING_ROOM("Meeting Room"),
    EQUIPMENT("Equipment"),
    STUDY_AREA("Study Area"),
    AUDITORIUM("Auditorium");

    private final String displayName;

    FacilityType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
