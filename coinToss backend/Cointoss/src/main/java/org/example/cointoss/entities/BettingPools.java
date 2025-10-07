package org.example.cointoss.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name="betting_pools")
public class BettingPools {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "asset_pair", nullable = false, length = 50)
    private String assetPair;

    @Column(nullable = false, length = 10)
    private String status;

    @Column(name = "start_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal startPrice;

    @Column(name = "end_price", precision = 10, scale = 2)
    private BigDecimal endPrice;

    @Column(name = "total_up_pool", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalUpPool = BigDecimal.ZERO;

    @Column(name = "total_down_pool", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalDownPool = BigDecimal.ZERO;

    @Column(name = "open_time", nullable = false, updatable = false)
    private OffsetDateTime openTime = OffsetDateTime.now();

    @Column(name = "lock_time")
    private OffsetDateTime lockTime;

    @Column(name = "settlement_time")
    private OffsetDateTime settlementTime;
}
