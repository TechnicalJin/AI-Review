package com.yrhp.crud.service;

import com.google.gson.Gson;
import com.yrhp.crud.request.ChatGPTRequest;
import com.yrhp.crud.response.ChatGPTResponse;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.config.RequestConfig;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.yrhp.crud.exception.OpenAIException;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import java.util.concurrent.TimeUnit;
import com.google.gson.JsonSyntaxException;
import org.springframework.http.HttpStatus;
import java.io.IOException;

@Service
public class ChatGPTService {

    private static final Logger log = LoggerFactory.getLogger(ChatGPTService.class);

    @Value("${OPEN_AI_URL}")
    private String OPEN_AI_URL;

    @Value("${OPEN_AI_KEY}")
    private String OPEN_AI_KEY;

    private static final int TIMEOUT = 30;

    public String getResponse(String query) {
        if (query == null || query.trim().isEmpty()) {
            throw new IllegalArgumentException("Query cannot be empty");
        }

        log.info("Processing request with query: {}", query);

        ChatGPTRequest chatGPTRequest = new ChatGPTRequest();
        chatGPTRequest.setMessages(query);

        try {
            return executeRequest(chatGPTRequest);
        } catch (IOException e) {
            log.error("Error while calling OpenAI API", e);
            throw new OpenAIException("Failed to get response from OpenAI", e);
        }
    }

    private String executeRequest(ChatGPTRequest chatGPTRequest) throws IOException {
        HttpPost post = new HttpPost(OPEN_AI_URL);
        post.setHeader("Content-Type", "application/json");
        post.setHeader("Authorization", "Bearer " + OPEN_AI_KEY);

        RequestConfig requestConfig = RequestConfig.custom()
            .setConnectTimeout(TIMEOUT, TimeUnit.SECONDS)
            .setResponseTimeout(TIMEOUT, TimeUnit.SECONDS)
            .build();

        Gson gson = new Gson();
        String body = gson.toJson(chatGPTRequest);
        
        post.setEntity(new StringEntity(body, ContentType.APPLICATION_JSON));

        try (CloseableHttpClient httpClient = HttpClients.custom()
                .setDefaultRequestConfig(requestConfig)
                .build()) {
            
            return httpClient.execute(post, response -> {
                String responseBody = EntityUtils.toString(response.getEntity());
                int statusCode = response.getCode();

                if (statusCode != HttpStatus.OK.value()) {
                    String errorMessage = String.format("OpenAI API error (Status %d): %s", 
                        statusCode, responseBody);
                    log.error(errorMessage);
                    
                    if (statusCode == HttpStatus.UNAUTHORIZED.value()) {
                        throw new OpenAIException("Invalid API key or unauthorized access");
                    } else if (statusCode == HttpStatus.TOO_MANY_REQUESTS.value()) {
                        throw new OpenAIException("Rate limit exceeded");
                    }
                    throw new OpenAIException(errorMessage);
                }

                try {
                    ChatGPTResponse chatGPTResponse = gson.fromJson(responseBody, ChatGPTResponse.class);
                    
                    if (chatGPTResponse == null) {
                        throw new OpenAIException("Received null response from OpenAI");
                    }
                    
                    if (chatGPTResponse.getChoices() == null || chatGPTResponse.getChoices().isEmpty()) {
                        throw new OpenAIException("No response choices received from OpenAI");
                    }

                    return chatGPTResponse.getChoices().get(0).getMessage().getContent();
                } catch (JsonSyntaxException e) {
                    log.error("Failed to parse OpenAI response: {}", responseBody, e);
                    throw new OpenAIException("Failed to parse OpenAI response", e);
                }
            });
        }
    }
}