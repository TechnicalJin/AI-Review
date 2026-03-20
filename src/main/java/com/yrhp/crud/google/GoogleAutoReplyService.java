package com.yrhp.crud.google;

import com.google.gson.JsonObject;
import com.yrhp.crud.model.Client;
import com.yrhp.crud.model.GoogleReplyLog;
import com.yrhp.crud.repository.ClientRepository;
import com.yrhp.crud.repository.GoogleReplyLogRepository;
import org.slf4j.*;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class GoogleAutoReplyService {

    private static final Logger log =
        LoggerFactory.getLogger(GoogleAutoReplyService.class);

    private final ClientRepository clientRepository;
    private final GoogleReplyLogRepository logRepository;
    private final GoogleReviewFetcherService fetcher;
    private final GoogleReplyGeneratorService generator;
    private final GoogleReviewReplierService replier;

    public GoogleAutoReplyService(
            ClientRepository clientRepository,
            GoogleReplyLogRepository logRepository,
            GoogleReviewFetcherService fetcher,
            GoogleReplyGeneratorService generator,
            GoogleReviewReplierService replier) {
        this.clientRepository = clientRepository;
        this.logRepository = logRepository;
        this.fetcher = fetcher;
        this.generator = generator;
        this.replier = replier;
    }

    public void processAllClients() {
        List<Client> clients = clientRepository
            .findByAutoReplyEnabledTrue();

        log.info("Auto-reply: processing {} enabled clients", clients.size());

        for (Client client : clients) {
            if (client.getGoogleAccessToken() == null) continue;
            try {
                processClient(client);
            } catch (Exception e) {
                log.error("Error processing client {}: {}",
                    client.getName(), e.getMessage(), e);
            }
        }
    }

    private void processClient(Client client) throws Exception {
        List<JsonObject> reviews = fetcher.fetchReviews(client);
        log.info("Client {}: {} reviews found", client.getName(), reviews.size());

        for (JsonObject review : reviews) {
            String reviewId = review.get("name").getAsString();

            // Skip if already replied
            if (logRepository.existsByReviewId(reviewId)) {
                log.debug("Already replied to review: {}", reviewId);
                continue;
            }

            // Skip if Google already has a reply
            if (review.has("reviewReply") &&
                !review.get("reviewReply").isJsonNull()) {
                saveSkippedLog(client, review, reviewId);
                continue;
            }

            replyToReview(client, review, reviewId);

            // Random delay 2-4 minutes between replies
            Thread.sleep((long)(Math.random() * 120000) + 120000);
        }
    }

    private void replyToReview(Client client, JsonObject review,
                               String reviewId) {
        GoogleReplyLog replyLog = new GoogleReplyLog();
        replyLog.setClientId(client.getId());
        replyLog.setReviewId(reviewId);

        try {
            String reviewText = review.has("comment")
                ? review.get("comment").getAsString() : "";
            String rating = review.get("starRating").getAsString();
            String reviewerName = review.getAsJsonObject("reviewer")
                .get("displayName").getAsString();

            replyLog.setReviewText(reviewText);
            replyLog.setReviewRating(rating);
            replyLog.setReviewerName(reviewerName);

            String replyText = generator.generateReply(
                client, reviewText, rating, reviewerName);
            replier.postReply(client, reviewId, replyText);

            replyLog.setReplyText(replyText);
            replyLog.setStatus("REPLIED");
            replyLog.setRepliedAt(LocalDateTime.now());
            log.info("Replied to review {} for client {}",
                reviewId, client.getName());

        } catch (Exception e) {
            replyLog.setStatus("FAILED");
            replyLog.setErrorMessage(e.getMessage());
            replyLog.setRepliedAt(LocalDateTime.now());
            log.error("Failed to reply to {}: {}", reviewId, e.getMessage());
        } finally {
            try { logRepository.save(replyLog); }
            catch (Exception ex) {
                log.error("Failed to save reply log", ex);
            }
        }
    }

    private void saveSkippedLog(Client client, JsonObject review,
                                String reviewId) {
        GoogleReplyLog log2 = new GoogleReplyLog();
        log2.setClientId(client.getId());
        log2.setReviewId(reviewId);
        log2.setStatus("SKIPPED");
        log2.setRepliedAt(LocalDateTime.now());
        logRepository.save(log2);
    }
}