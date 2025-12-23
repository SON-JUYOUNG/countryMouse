package com.lci.platform.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lci.platform.entity.RegionLci;
import com.lci.platform.repository.RegionLciRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

        private final RegionLciRepository repository;
        private final ObjectMapper objectMapper;

        @Override
        public void run(String... args) {
                System.out.println(">>> CHECKPOINT: Running DataInitializer");
                if (repository.count() == 0) {
                        try {
                                InputStream inputStream = TypeReference.class.getResourceAsStream("/regions_data.json");
                                if (inputStream == null) {
                                        System.err.println(">>> ERROR: regions_data.json not found!");
                                        return;
                                }

                                System.out.println(">>> CHECKPOINT: Found JSON file");

                                // Use explicit UTF-8 encoding
                                List<RegionLci> regions = objectMapper.readValue(
                                                new InputStreamReader(inputStream, StandardCharsets.UTF_8),
                                                new TypeReference<List<RegionLci>>() {
                                                });

                                System.out.println(">>> CHECKPOINT: Parsed " + regions.size() + " regions");

                                // Enhance data safely
                                regions.forEach(r -> {
                                        if (r.getTimeToWork() == 0 || r.getTimeToWork() == null)
                                                r.setTimeToWork(45);

                                        // Simple logic safely
                                        try {
                                                if (r.getDescription() == null || r.getDescription().isEmpty()) {
                                                        long dep = r.getAvgDeposit() != null ? r.getAvgDeposit() : 0;
                                                        long rent = r.getAvgRent() != null ? r.getAvgRent() : 0;
                                                        long jeonse = r.getAvgJeonse() != null ? r.getAvgJeonse() : 0;

                                                        String desc = String.format("평균 월세 %d/%d (전세 %d) | 데이터 200+건",
                                                                        dep / 10000, rent / 10000, jeonse / 10000);
                                                        r.setDescription(desc);
                                                }
                                        } catch (Exception ex) {
                                                // ignore desc error
                                        }
                                });

                                repository.saveAll(regions);
                                System.out.println(">>> CHECKPOINT: Saved regions to DB");
                        } catch (Throwable e) {
                                System.err.println(">>> CRITICAL ERROR IN DATA INITIALIZER:");
                                e.printStackTrace();
                        }
                }
        }
}
