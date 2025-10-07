package org.example.cointoss;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class CointossApplication {

    public static void main(String[] args) {
        SpringApplication.run(CointossApplication.class, args);
    }

}
