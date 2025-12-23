package com.lci.platform.service;

import com.lci.platform.dto.SimulationRequest;
import com.lci.platform.dto.SimulationResult;
import com.lci.platform.entity.RegionLci;
import com.lci.platform.repository.RegionLciRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SimulationService {

        private final RegionLciRepository repository;

        private static final double INTEREST_RATE = 0.04;
        private static final int WORKING_DAYS = 22;

        public List<RegionLci> getAllRegions() {
                return repository.findAll();
        }

        public List<SimulationResult> runSimulation(SimulationRequest request) {
                long hourlyWage = request.getMonthlyIncome() > 0 ? (long) request.getMonthlyIncome() / 209 : 0;

                List<RegionLci> allRegions = repository.findAll();

                RegionLci currentRegion = repository.findByName(request.getCurrentLiving())
                                .orElse(allRegions.stream().findFirst().orElse(null));

                // Sanity Check: If DB is empty or current city not found, use defaults
                long currentEstimatedSavings = (currentRegion != null)
                                ? calculateEstimatedSavings(request, currentRegion)
                                : 0;
                int currentWorkTime = (currentRegion != null) ? currentRegion.getTimeToWork() : 60;

                return allRegions.stream()
                                .map(region -> {
                                        // Real Housing Cost = Rent + Monthy Interest on Deposit
                                        long realHousingCost = (region.getAvgRent() != null ? region.getAvgRent() : 0L)
                                                        + (long) (((region.getAvgDeposit() != null
                                                                        ? region.getAvgDeposit()
                                                                        : 0L) * INTEREST_RATE) / 12);

                                        long opportunityCost = (long) ((region.getTimeToWork() * 2 * WORKING_DAYS
                                                        / 60.0)
                                                        * hourlyWage);
                                        long estimatedSavings = calculateEstimatedSavings(request, region);

                                        String desc = region.getDescription();
                                        if (desc == null || desc.isEmpty() || desc.contains("실거래")
                                                        || desc.contains("기반")) {
                                                desc = String.format("평균 월세 %d/%d (전세 %d) | 분석 완료",
                                                                (region.getAvgDeposit() != null ? region.getAvgDeposit()
                                                                                : 0L) / 10000,
                                                                (region.getAvgRent() != null ? region.getAvgRent() : 0L)
                                                                                / 10000,
                                                                (region.getAvgJeonse() != null ? region.getAvgJeonse()
                                                                                : 0L) / 10000);
                                        }

                                        return SimulationResult.builder()
                                                        .regionName(region.getName())
                                                        .estimatedSavings(estimatedSavings)
                                                        .timeGap(currentWorkTime - region.getTimeToWork())
                                                        .savingsGap(estimatedSavings - currentEstimatedSavings)
                                                        .realHousingCost(realHousingCost)
                                                        .livingCost(region.getAvgLivingCost() != null
                                                                        ? region.getAvgLivingCost()
                                                                        : 0L)
                                                        .opportunityCost(opportunityCost)
                                                        .safetyScore(region.getInfraScore() != null
                                                                        ? region.getInfraScore()
                                                                        : 70)
                                                        .lat(region.getLat() != null ? region.getLat() : 37.5665)
                                                        .lng(region.getLng() != null ? region.getLng() : 126.9780)
                                                        .description(desc)
                                                        .build();
                                })
                                .sorted((a, b) -> b.getEstimatedSavings().compareTo(a.getEstimatedSavings()))
                                .limit(30)
                                .collect(Collectors.toList());
        }

        private long calculateEstimatedSavings(SimulationRequest request, RegionLci region) {
                long realHousingCost = (region.getAvgRent() != null ? region.getAvgRent() : 0L)
                                + (long) (((region.getAvgDeposit() != null ? region.getAvgDeposit() : 0L)
                                                * INTEREST_RATE) / 12);
                return (long) request.getMonthlyIncome()
                                - (realHousingCost
                                                + (region.getAvgLivingCost() != null ? region.getAvgLivingCost() : 0L)
                                                + (region.getTransitCost() != null ? region.getTransitCost() : 0L));
        }
}
