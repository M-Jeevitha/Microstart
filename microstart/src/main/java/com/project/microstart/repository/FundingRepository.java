package com.project.microstart.repository;

import com.project.microstart.entity.Funding;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FundingRepository extends JpaRepository<Funding, Long> {

    List<Funding> findByActiveTrue();
}
