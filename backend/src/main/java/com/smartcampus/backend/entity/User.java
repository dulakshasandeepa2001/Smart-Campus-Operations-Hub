package com.smartcampus.backend.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "users")
public class User {

    @Id
    private String id;
    private String email;
    private String password;
    private String fullName;
    private String studentId;
    private String phoneNumber;
    private String department;
    private Integer studentYear;  // 1, 2, 3, 4 for first, second, third, fourth year
    private String studentGroup;  // Group 1, 2, 3, 4, etc.
    private String lecturerId;
    private String lectureMail;
    private String technicianId;
    private String privateMail;
    private UserRole role;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public User() {}

    public User(String email, String password, String fullName, String studentId, String phoneNumber, String department, UserRole role, Boolean active) {
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.studentId = studentId;
        this.phoneNumber = phoneNumber;
        this.department = department;
        this.role = role;
        this.active = active;
    }

    // Getters
    public String getId() { return id; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getFullName() { return fullName; }
    public String getStudentId() { return studentId; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getDepartment() { return department; }
    public Integer getStudentYear() { return studentYear; }
    public String getStudentGroup() { return studentGroup; }
    public UserRole getRole() { return role; }
    public String getLecturerId() { return lecturerId; }
    public String getLectureMail() { return lectureMail; }
    public String getTechnicianId() { return technicianId; }
    public String getPrivateMail() { return privateMail; }
    public Boolean getActive() { return active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    // Setters
    public void setId(String id) { this.id = id; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public void setDepartment(String department) { this.department = department; }
    public void setStudentYear(Integer studentYear) { this.studentYear = studentYear; }
    public void setStudentGroup(String studentGroup) { this.studentGroup = studentGroup; }
    public void setRole(UserRole role) { this.role = role; }
    public void setLecturerId(String lecturerId) { this.lecturerId = lecturerId; }
    public void setLectureMail(String lectureMail) { this.lectureMail = lectureMail; }
    public void setTechnicianId(String technicianId) { this.technicianId = technicianId; }
    public void setPrivateMail(String privateMail) { this.privateMail = privateMail; }
    public void setActive(Boolean active) { this.active = active; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Builder
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String email;
        private String password;
        private String fullName;
        private String studentId;
        private String phoneNumber;
        private String department;
        private Integer studentYear;
        private String studentGroup;
        private String lecturerId;
        private String lectureMail;
        private String technicianId;
        private String privateMail;
        private UserRole role;
        private Boolean active;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Builder id(String id) { this.id = id; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder password(String password) { this.password = password; return this; }
        public Builder fullName(String fullName) { this.fullName = fullName; return this; }
        public Builder studentId(String studentId) { this.studentId = studentId; return this; }
        public Builder phoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; return this; }
        public Builder department(String department) { this.department = department; return this; }
        public Builder studentYear(Integer studentYear) { this.studentYear = studentYear; return this; }
        public Builder studentGroup(String studentGroup) { this.studentGroup = studentGroup; return this; }
        public Builder lecturerId(String lecturerId) { this.lecturerId = lecturerId; return this; }
        public Builder lectureMail(String lectureMail) { this.lectureMail = lectureMail; return this; }
        public Builder technicianId(String technicianId) { this.technicianId = technicianId; return this; }
        public Builder privateMail(String privateMail) { this.privateMail = privateMail; return this; }
        public Builder role(UserRole role) { this.role = role; return this; }
        public Builder active(Boolean active) { this.active = active; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public User build() {
            User user = new User(email, password, fullName, studentId, phoneNumber, department, role, active);
            user.setId(id);
            user.setStudentYear(studentYear);
            user.setStudentGroup(studentGroup);
            user.setLecturerId(lecturerId);
            user.setLectureMail(lectureMail);
            user.setTechnicianId(technicianId);
            user.setPrivateMail(privateMail);
            user.setCreatedAt(createdAt);
            user.setUpdatedAt(updatedAt);
            return user;
        }
    }

    public enum UserRole {
        STUDENT, LECTURER, TECHNICIAN, ADMIN
    }
}
