package org.example.cointoss.config;

import lombok.AllArgsConstructor;
import org.example.cointoss.entities.Role;
import org.example.cointoss.filters.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
@AllArgsConstructor
public class SecurityConfig {
    private final UserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public AuthenticationManager getAuthenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {return new BCryptPasswordEncoder();}

    @Bean
    @SuppressWarnings("deprecation")
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setPasswordEncoder(passwordEncoder());
        provider.setUserDetailsService(userDetailsService);
        return provider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(withDefaults())
                .sessionManagement(c->
                        c.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(c->c
                        // Swagger/OpenAPI Documentation
                        .requestMatchers("/swagger-ui/**").permitAll()
                        .requestMatchers("/swagger-ui.html").permitAll()
                        .requestMatchers("/v3/api-docs/**").permitAll()
                        
                        // Public Authentication Endpoints
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/refresh").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/auth/me").permitAll()
                        
                        // Public User Registration
                        .requestMatchers(HttpMethod.POST, "/api/users").permitAll()
                        
                        // Protected User Management (requires authentication)
                        .requestMatchers(HttpMethod.PUT, "/api/users/*/changeUsername").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/users/*/changeEmail").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/users/*/change-password").authenticated()
                        
                        // Protected Wallet Endpoints (requires authentication)
                        .requestMatchers("/api/wallets/**").authenticated()
                        
                        // Protected Betting Endpoints (requires authentication)
                        .requestMatchers("/api/bets/**").authenticated()
                        
                        // Admin Endpoints (requires ADMIN role)
                        .requestMatchers("/admin/**").hasRole(Role.ADMIN.name())
                        
                        // Public Webhooks (external services)
                        .requestMatchers(HttpMethod.POST, "/api/webhook/**").permitAll()
                        
                        // WebSocket Endpoints
                        .requestMatchers("/ws/**").permitAll()
                        
                        // Debug Endpoints (consider making these protected in production)
                        .requestMatchers(HttpMethod.GET, "/debug/health").permitAll()
                        .requestMatchers("/debug/**").authenticated()
                        
                        // All other requests require authentication
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(c ->
                {
                    c.authenticationEntryPoint(
                            new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED));
                    c.accessDeniedHandler((request, response, accessDeniedException) ->
                            response.setStatus(HttpStatus.FORBIDDEN.value()));
                });
        return http.build();
    }
}
