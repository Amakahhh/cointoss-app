package org.example.cointoss.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.cointoss.entities.User;
import org.example.cointoss.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseInitializer implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        initializeTestUsers();
    }
    
    private void initializeTestUsers() {
        // Check if test user already exists
        if (userRepository.findByEmail("test@example.com").isEmpty()) {
            User testUser = new User();
            testUser.setEmail("test@example.com");
            testUser.setFirstName("Test");
            testUser.setLastName("User");
            
            // Properly encode the password
            String encodedPassword = passwordEncoder.encode("password123");
            testUser.setPassword(encodedPassword);
            
            userRepository.save(testUser);
            log.info("Created test user: test@example.com with properly encoded password");
            log.info("Password hash: {}", encodedPassword.substring(0, 20) + "...");
        }
        
        // Also create the testuser@example.com with proper encoding
        if (userRepository.findByEmail("testuser@example.com").isEmpty()) {
            User testUser2 = new User();
            testUser2.setEmail("testuser@example.com");
            testUser2.setFirstName("Test");
            testUser2.setLastName("User2");
            
            // Properly encode the password
            String encodedPassword = passwordEncoder.encode("password123");
            testUser2.setPassword(encodedPassword);
            
            userRepository.save(testUser2);
            log.info("Created test user: testuser@example.com with properly encoded password");
            log.info("Password hash: {}", encodedPassword.substring(0, 20) + "...");
        }
    }
}