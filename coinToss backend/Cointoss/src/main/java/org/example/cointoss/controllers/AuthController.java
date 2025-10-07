package org.example.cointoss.controllers;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.cointoss.config.JwtConfig;
import org.example.cointoss.dtos.JwtResponse;
import org.example.cointoss.dtos.LoginRequest;
import org.example.cointoss.dtos.UserDto;
import org.example.cointoss.mappers.UserMapper;
import org.example.cointoss.repositories.UserRepository;
import org.example.cointoss.service.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@AllArgsConstructor
@Slf4j
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final JwtConfig jwtConfig;
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    /**
     * POST /auth/login
     *
     * Purpose:
     * - Authenticates a user using email + password.
     * - If valid, generates both an access token (short-lived) and refresh token (long-lived).
     * - The refresh token is stored in an HttpOnly cookie (so it can't be accessed by JavaScript).
     * - Returns the access token to the client in the response body.
     *
     * Who should use this:
     * - Anyone who wants to log in to the application (registered users).
     * - Publicly accessible, since you can't require authentication before logging in.
     */

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {
        
        log.info("Login attempt for email: {}", request.getEmail());
        
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
            log.info("Authentication successful for email: {}", request.getEmail());
            
        } catch (BadCredentialsException e) {
            log.error("Authentication failed for email: {} - Bad credentials", request.getEmail());
            throw e;
        } catch (Exception e) {
            log.error("Authentication failed for email: {} - Error: {}", request.getEmail(), e.getMessage());
            throw e;
        }
        
        var user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        var accessToken = jwtService.generateAccessToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);

        var cookie = new Cookie("refreshToken", refreshToken.toString());
        cookie.setHttpOnly(true);
        cookie.setPath("/auth/refresh");
        cookie.setMaxAge(jwtConfig.getRefreshTokenExpiration()); // 7 days
        cookie.setSecure(jwtConfig.isCookieSecure()); // Configurable per profile
        response.addCookie(cookie);

        log.info("Login successful for email: {}", request.getEmail());
        return ResponseEntity.ok(new JwtResponse(accessToken.toString()));
    }


    /**
     * POST /auth/refresh
     *
     * Purpose:
     * - Issues a new access token when the old one expires, using the refresh token.
     * - Reads the refresh token from the secure HttpOnly cookie.
     * - Verifies that the refresh token is still valid (not expired, not tampered with).
     * - If valid, generates and returns a new access token.
     *
     * Who should use this:
     * - Authenticated users whose access tokens expired but still have a valid refresh token.
     * - Publicly accessible in the sense that no access token is required, but only valid refresh tokens can call it.
     */

    @PostMapping("/refresh")
    public ResponseEntity<JwtResponse> refresh(
           @CookieValue(value = "refreshToken") String refreshToken
    ) {
        var jwt =   jwtService.parseToken(refreshToken);
        if (jwt == null || jwt.isExpired()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        var user = userRepository.findById(jwt.getUserId()).orElseThrow();
        var accessToken = jwtService.generateAccessToken(user);

        return ResponseEntity.ok(new JwtResponse(accessToken.toString()));
    }

    /**
     * GET /auth/me
     *
     * Purpose:
     * - Returns details about the currently authenticated user.
     * - Extracts the user ID from the current security context (set by Spring Security after token validation).
     * - Loads the full user entity and maps it to a UserDto for response.
     *
     * Who should use this:
     * - Only authenticated users with a valid access token.
     * - Useful for displaying the user's profile in the frontend (e.g., "My Account" page).
     */

    @GetMapping("/me")
    public ResponseEntity<UserDto> me (){
       var authentication= SecurityContextHolder.getContext().getAuthentication();
       var userId = (Long)  authentication.getPrincipal();

       var user = userRepository.findById(userId).orElse(null);
       if(user == null){
           return ResponseEntity.notFound().build();
       }
       var userDto = userMapper.toDto(user);
       return ResponseEntity.ok(userDto);
    }

    /**
     * Exception Handler for invalid login attempts.
     *
     * Purpose:
     * - Catches BadCredentialsException thrown when authentication fails (wrong email or password).
     * - Returns HTTP 401 Unauthorized instead of a stack trace.
     *
     * Who should use this:
     * - Not directly called by users. It's automatically triggered if login fails.
     * - Helps frontend clients handle "invalid credentials" cleanly.
     */

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Void> handleBadCredentialsException(){
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
}
