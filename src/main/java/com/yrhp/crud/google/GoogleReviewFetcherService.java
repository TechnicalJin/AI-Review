package com.yrhp.crud.google;

import com.google.gson.*;
import com.yrhp.crud.model.Client;
import org.springframework.stereotype.Service;
import java.net.*;
import java.net.http.*;
import java.util.*;

@Service
public class GoogleReviewFetcherService {

    private static final String BASE_URL =
        "https://mybusiness.googleapis.com/v4";
    private final GoogleOAuthService oAuthService;
    private final Gson gson = new Gson();

    public GoogleReviewFetcherService(GoogleOAuthService oAuthService) {
        this.oAuthService = oAuthService;
    }

    public List<JsonObject> fetchReviews(Client client) throws Exception {
        String token = oAuthService.getValidAccessToken(client);

        String url = BASE_URL + "/accounts/" + client.getGoogleAccountId()
            + "/locations/" + client.getGoogleLocationId() + "/reviews";

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("Authorization", "Bearer " + token)
            .GET()
            .build();

        HttpResponse<String> response = HttpClient.newHttpClient()
            .send(request, HttpResponse.BodyHandlers.ofString());

        JsonObject body = gson.fromJson(response.body(), JsonObject.class);
        List<JsonObject> reviews = new ArrayList<>();

        if (body.has("reviews")) {
            for (JsonElement el : body.getAsJsonArray("reviews")) {
                reviews.add(el.getAsJsonObject());
            }
        }
        return reviews;
    }
}