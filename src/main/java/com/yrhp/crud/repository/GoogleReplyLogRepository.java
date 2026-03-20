package com.yrhp.crud.repository;

import com.yrhp.crud.model.GoogleReplyLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GoogleReplyLogRepository
        extends JpaRepository<GoogleReplyLog, Long> {

    boolean existsByReviewId(String reviewId);

    List<GoogleReplyLog> findByClientIdOrderByRepliedAtDesc(int clientId);

    long countByClientIdAndStatus(int clientId, String status);
}