package com.smartcampus.backend.config;

import com.smartcampus.backend.entity.User;
import com.smartcampus.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        try {
            // Initialize test accounts only if they don't exist
            initializeLecturerAccount();
            initializeAdminAccount();
        } catch (Exception e) {
            System.err.println("❌ Error initializing test accounts: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void initializeLecturerAccount() {
        String lectureMail = "professor.smith@test.com";
        String email = "professor.smith@university.edu";
        
        // Check if account already exists by lectureMail
        if (userRepository.existsByLectureMail(lectureMail)) {
            return;
        }

        User lecturer = new User();
        lecturer.setEmail(email);  // Secondary email
        lecturer.setPassword(passwordEncoder.encode("Smith123!Professor"));
        lecturer.setFullName("Professor Smith");
        lecturer.setLectureMail(lectureMail);  // PRIMARY LOGIN EMAIL
        lecturer.setLecturerId("PROF001");
        lecturer.setDepartment("Computer Science");
        lecturer.setPhoneNumber("+1-555-0123");
        lecturer.setRole(User.UserRole.LECTURER);
        lecturer.setActive(true);
        lecturer.setCreatedAt(LocalDateTime.now());
        lecturer.setUpdatedAt(LocalDateTime.now());

        userRepository.save(lecturer);
        System.out.println("✅ Lecturer account created!");
        System.out.println("   📧 Primary Login (Lecture Mail): " + lectureMail);
        System.out.println("   🔐 Password: Smith123!Professor");
        System.out.println("   📝 Secondary Email: " + email);
    }

    private void initializeAdminAccount() {
        String email = "admin@smartcampus.edu";
        
        // Check if account already exists
        if (userRepository.existsByEmail(email)) {
            return;
        }

        User admin = new User();
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode("Admin123@"));
        admin.setFullName("System Admin");
        admin.setDepartment("Administration");
        admin.setPhoneNumber("+1-555-0000");
        admin.setRole(User.UserRole.ADMIN);
        admin.setActive(true);
        admin.setCreatedAt(LocalDateTime.now());
        admin.setUpdatedAt(LocalDateTime.now());

        userRepository.save(admin);
        System.out.println("✅ Admin account created: " + email);
    }
}
