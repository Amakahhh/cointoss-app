package org.example.cointoss.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(@NonNull CorsRegistry registry) {
                registry.addMapping("/**") // Apply to all endpoints in the application
                        .allowedOrigins(
                                "https://coin-toss-tw57.vercel.app",
                                "http://localhost:3000",
                                "http://127.0.0.1:3000",
                                "https://coin-toss-tw57.vercel.app"
                        ) // Allow local dev and deployed frontend
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true); // Important for cookies (e.g., refreshToken)
            }
        };
    }
}
