package com.lci.platform.dto;

import lombok.Data;

@Data
public class SimulationRequest {
    private int monthlyIncome;
    private int targetSavings;
    private String workplace;
    private String currentLiving;
}
