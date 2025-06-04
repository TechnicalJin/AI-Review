package com.yrhp.crud.repository;

import com.yrhp.crud.model.ReviewGenerationLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ReviewGenerationLogRepository extends JpaRepository<ReviewGenerationLog, Long> {

    @Query("SELECT l FROM ReviewGenerationLog l WHERE " +
            "(:search IS NULL OR (" +
            "LOWER(l.companyName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(l.reviewLength) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(l.keyPoints) LIKE LOWER(CONCAT('%', :search, '%')))) AND " +
            "(:company IS NULL OR LOWER(l.companyName) = LOWER(:company)) AND " +
            "(:reviewLength IS NULL OR l.reviewLength = :reviewLength) AND " +
            "(:regenerated IS NULL OR l.regenerated = :regenerated) AND " +
            "(:keyPoints IS NULL OR LOWER(l.keyPoints) LIKE LOWER(CONCAT('%', :keyPoints, '%'))) AND " +
            "(:startDate IS NULL OR l.timestamp >= :startDate) AND " +
            "(:endDate IS NULL OR l.timestamp <= :endDate)")
    Page<ReviewGenerationLog> searchWithFilters(
            @Param("search") String search,
            @Param("company") String company,
            @Param("reviewLength") String reviewLength,
            @Param("regenerated") String regenerated,
            @Param("keyPoints") String keyPoints,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);

    @Query("SELECT DISTINCT l.companyName FROM ReviewGenerationLog l ORDER BY l.companyName")
    List<String> findDistinctCompanyNames();
}