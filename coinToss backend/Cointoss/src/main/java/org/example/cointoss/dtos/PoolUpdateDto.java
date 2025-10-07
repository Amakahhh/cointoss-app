package org.example.cointoss.dtos;

import java.math.BigDecimal;

public record PoolUpdateDto(
        Long poolId,
        BigDecimal totalUpPool,
        BigDecimal totalDownPool
) {}