package org.example.cointoss.config;

import org.springframework.boot.context.event.ApplicationEnvironmentPreparedEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class PortOverrideListener implements ApplicationListener<ApplicationEnvironmentPreparedEvent> {

    @Override
    public void onApplicationEvent(@NonNull ApplicationEnvironmentPreparedEvent event) {
        ConfigurableEnvironment environment = event.getEnvironment();
        
        // Force server port to 8080, overriding any system property
        Map<String, Object> props = new HashMap<>();
        props.put("server.port", 8080);
        
        // Add this as the highest priority property source
        environment.getPropertySources().addFirst(
            new MapPropertySource("portOverride", props)
        );
        
        // Also clear the system PORT property if it exists
        System.clearProperty("PORT");
        System.setProperty("server.port", "8080");
    }
}