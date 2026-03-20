package com.yrhp.crud.google;

import org.slf4j.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class GoogleReviewScheduler {

    private static final Logger log =
        LoggerFactory.getLogger(GoogleReviewScheduler.class);

    private final GoogleAutoReplyService autoReplyService;

    public GoogleReviewScheduler(GoogleAutoReplyService autoReplyService) {
        this.autoReplyService = autoReplyService;
    }

    // Runs every 5 minutes
    @Scheduled(fixedDelay = 300000, initialDelay = 60000)
    public void runAutoReply() {
        log.info("Scheduler: starting Google auto-reply run");
        try {
            autoReplyService.processAllClients();
        } catch (Exception e) {
            log.error("Scheduler error: {}", e.getMessage(), e);
        }
        log.info("Scheduler: completed Google auto-reply run");
    }
}