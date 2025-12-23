package com.lci.platform.repository;

import com.lci.platform.entity.RegionLci;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RegionLciRepository extends JpaRepository<RegionLci, Long> {
    Optional<RegionLci> findByName(String name);
}
