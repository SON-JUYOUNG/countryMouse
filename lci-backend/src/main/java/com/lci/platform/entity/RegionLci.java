package com.lci.platform.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "region_lci")
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

    // Housing Type Specific Data
    private Long aptAvgRent;
    private Long aptAvgJeonse;

    private Long officetelAvgRent;
    private Long officetelAvgJeonse;

    private Long villaAvgRent;
    private Long villaAvgJeonse;

    private Long oneRoomAvgRent;
    private Long oneRoomAvgJeonse;

    private Long twoRoomAvgRent;
    private Long twoRoomAvgJeonse;

    public RegionLci() {}

    public RegionLci(String name, Long avgRent, Long avgDeposit, Long avgJeonse, Long avgLivingCost, Integer timeToWork, Long transitCost, Double lat, Double lng, Integer infraScore, String description) {
        this.name = name;
        this.avgRent = avgRent;
        this.avgDeposit = avgDeposit;
        this.avgJeonse = avgJeonse;
        this.avgLivingCost = avgLivingCost;
        this.timeToWork = timeToWork;
        this.transitCost = transitCost;
        this.lat = lat;
        this.lng = lng;
        this.infraScore = infraScore;
        this.description = description;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Long getAvgRent() { return avgRent; }
    public void setAvgRent(Long avgRent) { this.avgRent = avgRent; }
    public Long getAvgDeposit() { return avgDeposit; }
    public void setAvgDeposit(Long avgDeposit) { this.avgDeposit = avgDeposit; }
    public Long getAvgJeonse() { return avgJeonse; }
    public void setAvgJeonse(Long avgJeonse) { this.avgJeonse = avgJeonse; }
    public Long getAvgLivingCost() { return avgLivingCost; }
    public void setAvgLivingCost(Long avgLivingCost) { this.avgLivingCost = avgLivingCost; }
    public Integer getTimeToWork() { return timeToWork; }
    public void setTimeToWork(Integer timeToWork) { this.timeToWork = timeToWork; }
    public Long getTransitCost() { return transitCost; }
    public void setTransitCost(Long transitCost) { this.transitCost = transitCost; }
    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }
    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }
    public Integer getInfraScore() { return infraScore; }
    public void setInfraScore(Integer infraScore) { this.infraScore = infraScore; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getAptAvgRent() { return aptAvgRent; }
    public void setAptAvgRent(Long aptAvgRent) { this.aptAvgRent = aptAvgRent; }
    public Long getAptAvgJeonse() { return aptAvgJeonse; }
    public void setAptAvgJeonse(Long aptAvgJeonse) { this.aptAvgJeonse = aptAvgJeonse; }
    
    public Long getOfficetelAvgRent() { return officetelAvgRent; }
    public void setOfficetelAvgRent(Long officetelAvgRent) { this.officetelAvgRent = officetelAvgRent; }
    public Long getOfficetelAvgJeonse() { return officetelAvgJeonse; }
    public void setOfficetelAvgJeonse(Long officetelAvgJeonse) { this.officetelAvgJeonse = officetelAvgJeonse; }

    public Long getVillaAvgRent() { return villaAvgRent; }
    public void setVillaAvgRent(Long villaAvgRent) { this.villaAvgRent = villaAvgRent; }
    public Long getVillaAvgJeonse() { return villaAvgJeonse; }
    public void setVillaAvgJeonse(Long villaAvgJeonse) { this.villaAvgJeonse = villaAvgJeonse; }

    public Long getOneRoomAvgRent() { return oneRoomAvgRent; }
    public void setOneRoomAvgRent(Long oneRoomAvgRent) { this.oneRoomAvgRent = oneRoomAvgRent; }
    public Long getOneRoomAvgJeonse() { return oneRoomAvgJeonse; }
    public void setOneRoomAvgJeonse(Long oneRoomAvgJeonse) { this.oneRoomAvgJeonse = oneRoomAvgJeonse; }

    public Long getTwoRoomAvgRent() { return twoRoomAvgRent; }
    public void setTwoRoomAvgRent(Long twoRoomAvgRent) { this.twoRoomAvgRent = twoRoomAvgRent; }
    public Long getTwoRoomAvgJeonse() { return twoRoomAvgJeonse; }
    public void setTwoRoomAvgJeonse(Long twoRoomAvgJeonse) { this.twoRoomAvgJeonse = twoRoomAvgJeonse; }
}
