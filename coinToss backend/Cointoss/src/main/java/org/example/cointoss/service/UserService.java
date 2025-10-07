package org.example.cointoss.service;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.cointoss.repositories.UserRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@AllArgsConstructor
@Service
@Slf4j
public class UserService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        log.info("Loading user by email: {}", email);
        
        var userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            log.error("User not found with email: {}", email);
            throw new UsernameNotFoundException("User not found with email: " + email);
        }
        
        var user = userOptional.get();
        log.info("Found user: {} with password hash: {}", user.getEmail(), user.getPassword().substring(0, 10) + "...");
        
        return new User(
                user.getEmail(),
                user.getPassword(),
                Collections.emptyList()
        );
    }
}
