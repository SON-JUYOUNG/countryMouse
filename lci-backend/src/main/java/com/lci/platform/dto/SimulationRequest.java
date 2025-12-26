package com.lci.platform.dto;

public record SimulationRequest(
    int monthlyIncome,
    int targetSavings,
    String workplace,
    String currentLiving
) {}
