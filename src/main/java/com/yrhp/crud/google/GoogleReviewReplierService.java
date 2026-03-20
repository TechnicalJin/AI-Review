package com.yrhp.crud.google;

import com.google.gson.*;
import com.yrhp.crud.model.Client;
import org.springframework.stereotype.Service;
import java.net.*;
import java.net.http.*;

@Service
public class GoogleReviewReplierService {

    private static final String BASE_URL =
        "https://mybusiness.googleapis.com/v4";
    private final GoogleOAuthService oAuthService;
    private final Gson gson = new Gson();

    public GoogleReviewReplierService(GoogleOAuthService oAuthService) {
        this.oAuthService = oAuthService;
    }

    // reviewName example: accounts/123/locations/456/reviews/ABC
    public void postReply(Client client, String reviewName,
                         String replyText) throws Exception {
        String token = oAuthService.getValidAccessToken(client);

        String url = BASE_URL + "/" + reviewName + "/reply";
        JsonObject body = new JsonObject();
        body.addProperty("comment", replyText);

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("Authorization", "Bearer " + token)
            .header("Content-Type", "application/json")
            .PUT(HttpRequest.BodyPublishers.ofString(gson.toJson(body)))
            .build();

        HttpResponse<String> response = HttpClient.newHttpClient()
            .send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Failed to post reply: " + response.body());
        }
    }
}