// src/main/java/org/example/cointoss/config/WebSocketConfig.java
package org.example.cointoss.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker // This enables WebSocket message handling, backed by a message broker.
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        // This registers a WebSocket endpoint that clients will connect to.
        // "/ws" is the URL for the WebSocket handshake.
        // .setAllowedOriginPatterns("*") allows connections from any origin (useful for development).
        registry.addEndpoint("/ws").setAllowedOrigins("https://coin-toss-tw57.vercel.app");
    }

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry registry) {
        // This configures our message broker, which is like a post office for messages.
        // It defines that messages whose destination starts with "/topic" should be routed to the broker.
        registry.enableSimpleBroker("/topic");
        // It also defines that messages from clients destined for the server should be prefixed with "/app".
        registry.setApplicationDestinationPrefixes("/app");
    }
}