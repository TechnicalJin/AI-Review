package com.yrhp.crud.google;

import com.yrhp.crud.model.Client;
import com.yrhp.crud.service.ChatGPTService;
import org.springframework.stereotype.Service;

@Service
public class GoogleReplyGeneratorService {

    private final ChatGPTService chatGPTService;

    public GoogleReplyGeneratorService(ChatGPTService chatGPTService) {
        this.chatGPTService = chatGPTService;
    }

    public String generateReply(Client client, String reviewText,
                               String rating, String reviewerName) {
        String style = client.getGoogleReplyStyle() != null
            ? client.getGoogleReplyStyle() : "professional";

        String prompt = String.format(
            "You are a business owner replying to a Google review.\n" +
            "Business Name: %s\n" +
            "Reviewer: %s\n" +
            "Star Rating: %s\n" +
            "Review: %s\n\n" +
            "Write a %s reply. Keep it under 150 words. " +
            "Do not use hashtags. Do not make up facts. " +
            "Thank the reviewer by name. If the rating is 1 or 2 stars, " +
            "apologize and offer to resolve the issue.",
            client.getName(), reviewerName, rating, reviewText, style
        );

        return chatGPTService.getResponse(prompt);
    }
}