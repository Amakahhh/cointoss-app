package org.example.cointoss.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.example.cointoss.dtos.TickerResponse;

import com.google.gson.Gson;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class QuidaxPaymentGateway implements CryptoPaymentGateway {
    @Value("${quidax.baseUrl}")
    private String baseUrl;

    @Override
    public TickerResponse getBuyPrice(String marketPair) {
        try {
            String url = baseUrl + "/markets/tickers/" + marketPair.toLowerCase();  // e.g. usdtngn

            HttpRequest getRequest = HttpRequest.newBuilder()
                    .uri(new URI(url))
                    .header("Content-Type", "application/json")
//                    .header("Authorization", "Your API Key")
                    .header("accept", "application/json")
                    .GET()
                    .build();
            HttpClient httpClient = HttpClient.newHttpClient();
            HttpResponse<String> getResponse = httpClient.send(getRequest, HttpResponse.BodyHandlers.ofString());
            Gson gson = new Gson();
            var response = gson.fromJson(getResponse.body(), TickerResponse.class);
            return response;
        }
        catch (Exception ex) {
            System.out.println("Error: Failed to fetch Quidax buy price for market.");
            System.out.println(ex.getMessage());
        }
        return null;
    }
}
