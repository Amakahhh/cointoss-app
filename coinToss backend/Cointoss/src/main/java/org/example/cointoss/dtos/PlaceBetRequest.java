// src/main/java/org/example/cointoss/dtos/PlaceBetRequest.java
package org.example.cointoss.dtos;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PlaceBetRequest {

    @NotNull(message = "Pool ID is required")
    private Long poolId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Bet amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Direction is required")
    private String direction;
}