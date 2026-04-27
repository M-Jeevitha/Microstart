package com.project.microstart.service;

import com.project.microstart.dto.FundingRequest;
import com.project.microstart.entity.Funding;
import com.project.microstart.repository.FundingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FundingService {

    private final FundingRepository fundingRepository;

    public Funding createFunding(FundingRequest request) {

        Funding funding = Funding.builder()
                .title(request.getTitle())
                .type(request.getType())
                .amount(request.getAmount())
                .description(request.getDescription())
                .active(true)
                .build();

        return fundingRepository.save(funding);
    }

    public List<Funding> getAllActiveFundings() {
        return fundingRepository.findByActiveTrue();
    }
}

