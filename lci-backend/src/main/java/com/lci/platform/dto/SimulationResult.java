package com.lci.platform.dto;

public record SimulationResult(
    String regionName,
    Long estimatedSavings,
    int timeGap,
    Long savingsGap,
    Long realHousingCost,
    Long livingCost,
    Long opportunityCost,
    int safetyScore,
    double lat,
    double lng,
    String description
) {}
