package org.example.cointoss.controllers;

import com.google.gson.Gson;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.example.cointoss.dtos.KorapayWebhookEvent;
import org.example.cointoss.service.PaymentGateway;
import org.example.cointoss.utilities.HmacUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedReader;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/webhook")
@RequiredArgsConstructor
public class WebhookController {
    private final PaymentGateway paymentGateway;

    @Value("${kora.secretKey}")
    private String korapaySecret;

    @PostMapping("/korapay")
    public ResponseEntity<String> receiveKorapayWebhook(HttpServletRequest request,
                                                        @RequestHeader("x-korapay-signature") String signature
    ) {
        try {
            // Get raw request body
            String payload;
            try (BufferedReader reader = request.getReader()) {
                payload = reader.lines().collect(Collectors.joining());
            }

            // Verify HMAC signature
            if (!HmacUtil.isValidSignature(payload, signature, korapaySecret)) {
                return ResponseEntity.status(401).body("Invalid signature");
            }

            // Deserialize payload
            KorapayWebhookEvent webhookEvent = new Gson().fromJson(payload, KorapayWebhookEvent.class);

            // Process event
            paymentGateway.handleWebhook(webhookEvent);

            return ResponseEntity.ok("Webhook processed successfully");

        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Error processing webhook");
        }
    }
}

