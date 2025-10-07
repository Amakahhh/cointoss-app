package org.example.cointoss.controllers;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.example.cointoss.dtos.*;
import org.example.cointoss.entities.Role;
import org.example.cointoss.entities.Wallet;
import org.example.cointoss.mappers.UserMapper;
import org.example.cointoss.repositories.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

@AllArgsConstructor
@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    /**
     * POST /users

     * Purpose:
     * - Registers a new user in the system.
     * - Validates that the email isn’t already taken.
     * - Hashes (encodes) the user’s password before saving.
     * - Assigns the default role USER.
     * - Returns the newly created user’s details and sets the Location header with their resource URI.

     * Who should use this:
     * - Anyone who wants to sign up for an account.
     * - Publicly accessible (no authentication required).
     */

    @PostMapping
    public ResponseEntity<?> registerUser(
            @Valid @RequestBody RegisterUserRequest request, UriComponentsBuilder uriBuilder) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(
                    Map.of("email", "Email already in use")
            );
        }
        var user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(Role.USER);

        // 1. Create a new Wallet instance. It starts with the default 100 NGN balance.
        Wallet newWallet = new Wallet();
        // 2. Link the wallet to the user.
        newWallet.setUser(user);
        // 3. Link the user to the wallet (completing the bidirectional link).
        user.setWallet(newWallet);

        user = userRepository.save(user);
        var userDto = userMapper.toDto(user);
        var uri = uriBuilder.path("/users/{id}").buildAndExpand(user.getId()).toUri();
        return ResponseEntity.created(uri).body(userDto);
    }

    /**
     * PUT /users/{id}/changeEmail

     * Purpose:
     * - Allows a user to update their email address.
     * - Loads the user by ID, applies the change, and saves it back.
     * - Returns the updated user details.

     * Who should use this:
     * - The authenticated user themselves (or possibly an admin).
     * - Should NOT be open to all users — requires access control to ensure one user
     *   can’t change another’s email.
     */

    @PutMapping("/{id}/changeEmail")
    public ResponseEntity<Object> changeEmail(
            @PathVariable(name = "id") Long id,
           @Valid @RequestBody UpdateEmailRequest request) {
        var user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        userMapper.updateEmail(request, user);
        userRepository.save(user);
        return ResponseEntity.ok(userMapper.toDto(user));
    }

    /**
     * PUT /users/{id}/changeUsername

     * Purpose:
     * - Allows a user to change their username.
     * - Loads the user by ID, updates their username, and saves it back.
     * - Returns the updated user details.

     * Who should use this:
     * - The authenticated user themselves (or possibly an admin).
     * - Requires authorization checks so users can’t update other users’ profiles.
     */

    @PutMapping({"/{id}/changeUsername"})
    public ResponseEntity<Object> changeUsername(
            @PathVariable (name = "id") Long id,
           @Valid @RequestBody UpdateNameRequest request) {
        var user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        userMapper.updateUsername(request,user);
        userRepository.save(user);
        return ResponseEntity.ok(userMapper.toDto(user));
    }

    /**
     * POST /users/{id}/change-password

     * Purpose:
     * - Allows a user to change their password.
     * - Requires the user to supply their old password for verification.
     * - If the old password is correct, stores the new password (hashed).
     * - Returns 204 No Content if successful.

     * Who should use this:
     * - The authenticated user themselves.
     * - Critical to protect with authorization checks (to prevent other users or attackers
     *   from changing someone else’s password).
     */

    @PostMapping("/{id}/change-password")
    public ResponseEntity<Void> changePassword(
            @PathVariable Long id,
            @RequestBody ChangePasswordRequest request) {

        var user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return ResponseEntity.noContent().build();
    }
}

