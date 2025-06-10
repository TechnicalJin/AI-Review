package com.yrhp.crud.service;

import com.yrhp.crud.model.ReviewGenerationLog;
import com.yrhp.crud.repository.ReviewGenerationLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReviewGenerationLogService {

    private static final Logger log = LoggerFactory.getLogger(ReviewGenerationLogService.class);

    @Autowired
    private ReviewGenerationLogRepository logRepository;

    /**
     * Retrieves logs for a client based on their company name.
     *
     * @param companyName The company name of the client
     * @return List of ReviewGenerationLog entries for the client
     */
    public List<ReviewGenerationLog> getLogsByCompanyName(String companyName) {
        log.info("Fetching logs for company: {}", companyName);
        List<ReviewGenerationLog> logs = logRepository.findByCompanyName(companyName);
        log.debug("Retrieved {} logs for company: {}", logs.size(), companyName);
        return logs;
    }

    /**
     * Searches logs with filters for pagination and dynamic querying.
     *
     * @param search       General search term for companyName, reviewLength, or keyPoints
     * @param company      Specific company name filter
     * @param reviewLength Review length filter (short, medium, large)
     * @param regenerated  Regenerated status filter (yes, no)
     * @param keyPoints    Key points filter
     * @param startDate    Start date for timestamp range
     * @param endDate      End date for timestamp range
     * @param pageable     Pagination information
     * @return Page of ReviewGenerationLog entries
     */
    public Page<ReviewGenerationLog> searchLogs(String search, String company, String reviewLength,
                                                String regenerated, String keyPoints,
                                                LocalDateTime startDate, LocalDateTime endDate,
                                                Pageable pageable) {
        log.info("Searching logs with filters - search: {}, company: {}, reviewLength: {}, regenerated: {}, keyPoints: {}, startDate: {}, endDate: {}",
                search, company, reviewLength, regenerated, keyPoints, startDate, endDate);
        Page<ReviewGenerationLog> logs = logRepository.searchWithFilters(
                search, company, reviewLength, regenerated, keyPoints, startDate, endDate, pageable);
        log.debug("Retrieved {} logs with filters", logs.getTotalElements());
        return logs;
    }

    /**
     * Retrieves distinct company names from the logs.
     *
     * @return List of unique company names
     */
    public List<String> getDistinctCompanyNames() {
        log.info("Fetching distinct company names");
        List<String> companyNames = logRepository.findDistinctCompanyNames();
        log.debug("Retrieved {} distinct company names", companyNames.size());
        return companyNames;
    }
}