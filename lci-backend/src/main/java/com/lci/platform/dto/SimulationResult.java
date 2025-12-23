package com.lci.platform.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SimulationResult {
    private String regionName;
    private Long estimatedSavings;
    private int timeGap;
    private Long savingsGap;
    private Long realHousingCost;
    private Long livingCost;
    private Long opportunityCost;
    private int safetyScore;
    private double lat;
    private double lng;
    private String description;
}
