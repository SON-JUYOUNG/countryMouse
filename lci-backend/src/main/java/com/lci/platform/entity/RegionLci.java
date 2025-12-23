package com.lci.platform.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "region_lci")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegionLci {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private Long avgRent;
    private Long avgDeposit;
    private Long avgJeonse;
    private Long avgLivingCost;
    private Integer timeToWork; // minutes (base)
    private Long transitCost;
    private Double lat;
    private Double lng;
    private Integer infraScore; // Safety + Infrastructure

    @Column(length = 500)
    private String description;
}
