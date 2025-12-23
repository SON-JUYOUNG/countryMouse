package com.lci.platform.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RegionLciDto {
    private String name;
    private int avgRent;
    private int avgDeposit;
    private int avgJeonse;
    private int avgLivingCost;
    private int timeToWork; // minutes
    private int transitCost;
    private double lat;
    private double lng;
    private int infraScore;
}
