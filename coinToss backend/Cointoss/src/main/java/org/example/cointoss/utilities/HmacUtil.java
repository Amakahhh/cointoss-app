package org.example.cointoss.utilities;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

public class HmacUtil {

    public static boolean isValidSignature(String payload, String signature, String secret) {
        try {
            // Parse JSON and extract the "data" object
            JsonObject json = JsonParser.parseString(payload).getAsJsonObject();
            JsonObject data = json.getAsJsonObject("data");

            if (data == null) {
                return false; // no data field
            }

            String dataString = data.toString();

            // Compute HMAC SHA256 of dataString
            Mac hmacSha256 = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            hmacSha256.init(secretKeySpec);
            byte[] hash = hmacSha256.doFinal(dataString.getBytes(StandardCharsets.UTF_8));

            // Convert to lowercase hex string
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            String expectedSignature = sb.toString();

            return expectedSignature.equals(signature);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
