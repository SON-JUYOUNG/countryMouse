package com.lci.platform.dto;

public record RegionLciDto(
    String name,
    int avgRent,
    int avgDeposit,
    int avgJeonse,
    int avgLivingCost,
    int timeToWork, // minutes
    int transitCost,
    double lat,
    double lng,
    int infraScore
) {}
