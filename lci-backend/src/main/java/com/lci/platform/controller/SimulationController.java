package com.lci.platform.controller;

import com.lci.platform.dto.SimulationRequest;
import com.lci.platform.dto.SimulationResult;
import com.lci.platform.entity.RegionLci;
import com.lci.platform.service.SimulationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/simulation")
@RequiredArgsConstructor
public class SimulationController {

    private final SimulationService simulationService;

    @PostMapping("/run")
    public List<SimulationResult> runSimulation(@RequestBody SimulationRequest request) {
        return simulationService.runSimulation(request);
    }

    @GetMapping("/regions")
    public List<RegionLci> getAllRegions() {
        return simulationService.getAllRegions();
    }
}
