package com.lci.platform.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lci.platform.entity.RegionLci;
import com.lci.platform.repository.RegionLciRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Configuration
public class DataInitializer implements CommandLineRunner {

        private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
        private final RegionLciRepository repository;
        private final ObjectMapper objectMapper;

        public DataInitializer(RegionLciRepository repository, ObjectMapper objectMapper) {
                this.repository = repository;
                this.objectMapper = objectMapper;
        }

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

                                List<RegionLci> regions = objectMapper.readValue(
                                                new InputStreamReader(inputStream, StandardCharsets.UTF_8),
                                                new TypeReference<List<RegionLci>>() {
                                                });

                                System.out.println(">>> CHECKPOINT: Parsed " + regions.size() + " regions");

                                regions.forEach(r -> {
                                        if (r.getTimeToWork() == 0 || r.getTimeToWork() == null)
                                                r.setTimeToWork(45);

                                        // Calculate Housing Type Specific Data based on Base Average
                                        long baseRent = r.getAvgRent() != null ? r.getAvgRent() : 500000;
                                        long baseJeonse = r.getAvgJeonse() != null ? r.getAvgJeonse() : 100000000;

                                        // Apartment (Most expensive)
                                        if (r.getAptAvgRent() == null || r.getAptAvgRent() == 0) r.setAptAvgRent((long)(baseRent * 1.4));
                                        if (r.getAptAvgJeonse() == null || r.getAptAvgJeonse() == 0) r.setAptAvgJeonse((long)(baseJeonse * 1.5));

                                        // Officetel (Similar to base)
                                        if (r.getOfficetelAvgRent() == null || r.getOfficetelAvgRent() == 0) r.setOfficetelAvgRent((long)(baseRent * 1.1));
                                        if (r.getOfficetelAvgJeonse() == null || r.getOfficetelAvgJeonse() == 0) r.setOfficetelAvgJeonse((long)(baseJeonse * 0.9));

                                        // Villa (Cheaper)
                                        if (r.getVillaAvgRent() == null || r.getVillaAvgRent() == 0) r.setVillaAvgRent((long)(baseRent * 0.8));
                                        if (r.getVillaAvgJeonse() == null || r.getVillaAvgJeonse() == 0) r.setVillaAvgJeonse((long)(baseJeonse * 0.7));

                                        // OneRoom (Cheapest)
                                        if (r.getOneRoomAvgRent() == null || r.getOneRoomAvgRent() == 0) r.setOneRoomAvgRent((long)(baseRent * 0.6));
                                        if (r.getOneRoomAvgJeonse() == null || r.getOneRoomAvgJeonse() == 0) r.setOneRoomAvgJeonse((long)(baseJeonse * 0.5));

                                        // TwoRoom (Between OneRoom and Villa)
                                        if (r.getTwoRoomAvgRent() == null || r.getTwoRoomAvgRent() == 0) r.setTwoRoomAvgRent((long)(baseRent * 0.75));
                                        if (r.getTwoRoomAvgJeonse() == null || r.getTwoRoomAvgJeonse() == 0) r.setTwoRoomAvgJeonse((long)(baseJeonse * 0.65));


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
