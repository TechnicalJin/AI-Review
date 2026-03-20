package com.yrhp.crud.google;

import com.google.gson.*;
import com.yrhp.crud.model.Client;
import com.yrhp.crud.repository.ClientRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.*;
import java.net.http.*;
import java.util.ArrayList;
import java.util.List;

@Service
public class GoogleOAuthService {

    private static final Logger log = LoggerFactory.getLogger(GoogleOAuthService.class);

    // ── Accounts Management API (to list accounts)
    private static final String ACCOUNTS_API =
            "https://mybusinessaccountmanagement.googleapis.com/v1/accounts";

    // ── Business Information API (to list locations under an account)
    private static final String LOCATIONS_API =
            "https://mybusinessbusinessinformation.googleapis.com/v1/accounts/%s/locations" +
                    "?readMask=name,title,storefrontAddress";

    @Value("${GOOGLE_CLIENT_ID}")
    private String clientId;

    @Value("${GOOGLE_CLIENT_SECRET}")
    private String clientSecret;

    // Admin callback — used by ROLE_USER (admin connects on behalf of client)
    @Value("${GOOGLE_REDIRECT_URI}")
    private String adminRedirectUri;

    // Client callback — used by ROLE_CLIENT (client connects themselves)
    @Value("${GOOGLE_CLIENT_REDIRECT_URI}")
    private String clientRedirectUri;

    private final ClientRepository clientRepository;
    private final TokenEncryptionUtil encryptionUtil;
    private final Gson gson = new Gson();

    public GoogleOAuthService(ClientRepository clientRepository,
                              TokenEncryptionUtil encryptionUtil) {
        this.clientRepository = clientRepository;
        this.encryptionUtil = encryptionUtil;
    }

    // ═══════════════════════════════════════════════════════════
    // URL BUILDERS
    // ═══════════════════════════════════════════════════════════

    /** Admin connects Google on behalf of a specific client. State = clientDbId */
    public String buildAuthorizationUrl(int clientDbId) {
        String url = buildUrl(adminRedirectUri, String.valueOf(clientDbId));
        log.info("ADMIN AUTH URL redirect_uri={}, state={}", adminRedirectUri, clientDbId);
        return url;
    }

    /** Client connects their own Google account. State = clientDbId */
    public String buildClientAuthorizationUrl(int clientDbId) {
        String state = "client_" + clientDbId;
        String url = buildUrl(clientRedirectUri, state);
        log.info("CLIENT AUTH URL redirect_uri={}, state={}", clientRedirectUri, state);
        return url;
    }

    public String getClientId() {
        return clientId;
    }

    private String buildUrl(String redirectUri, String state) {
        return "https://accounts.google.com/o/oauth2/v2/auth" +
                "?client_id=" + clientId +
                "&redirect_uri=" + URLEncoder.encode(redirectUri,
                java.nio.charset.StandardCharsets.UTF_8) +
                "&response_type=code" +
                "&scope=" + URLEncoder.encode(
                "https://www.googleapis.com/auth/business.manage",
                java.nio.charset.StandardCharsets.UTF_8) +
                "&access_type=offline" +
                "&prompt=consent" +
                "&state=" + state;
    }

    // ═══════════════════════════════════════════════════════════
    // TOKEN EXCHANGE — called after Google redirects back
    // ═══════════════════════════════════════════════════════════

    /**
     * Exchange authorization code for tokens, then auto-fetch
     * Account ID and Location ID from Google APIs.
     * Tokens are AES-encrypted before saving to the database.
     */
    public void exchangeCodeAndFetchBusinessData(String code,
                                                 int clientDbId,
                                                 boolean isClientCallback) throws Exception {
        String redirectUri = isClientCallback ? clientRedirectUri : adminRedirectUri;

        log.info("═══ Starting OAuth Exchange & Business Data Fetch ═══");
        log.info("Client DB ID: {}, Is Client Callback: {}", clientDbId, isClientCallback);

        // ── Step 1: Exchange code for tokens
        log.debug("Step 1: Exchanging authorization code for tokens...");
        String body = "code=" + URLEncoder.encode(code, "UTF-8") +
                "&client_id=" + clientId +
                "&client_secret=" + clientSecret +
                "&redirect_uri=" + URLEncoder.encode(redirectUri, "UTF-8") +
                "&grant_type=authorization_code";

        HttpResponse<String> tokenResponse = post(
                "https://oauth2.googleapis.com/token", body);

        if (tokenResponse.statusCode() != 200) {
            log.error("❌ Token exchange FAILED with status {}", tokenResponse.statusCode());
            log.error("Response body: {}", tokenResponse.body());
            throw new RuntimeException("Token exchange failed: " + tokenResponse.body());
        }

        log.info("✅ Token exchange successful (status 200)");
        JsonObject tokenJson = gson.fromJson(tokenResponse.body(), JsonObject.class);
        String rawAccessToken  = tokenJson.get("access_token").getAsString();
        String rawRefreshToken = tokenJson.has("refresh_token")
                ? tokenJson.get("refresh_token").getAsString() : null;
        long expiresIn = tokenJson.get("expires_in").getAsLong();

        log.debug("Access Token (first 50 chars): {}...",
                rawAccessToken.length() > 50 ? rawAccessToken.substring(0, 50) : "SHORT");
        log.debug("Refresh Token available: {}", rawRefreshToken != null);
        log.debug("Expires in: {} seconds", expiresIn);

        // ── Step 2: Fetch business account ID automatically
        log.debug("Step 2: Fetching Google Account ID...");
        String accountId = null;
        try {
            accountId = fetchAccountId(rawAccessToken);
            if (accountId != null) {
                log.info("✅ Auto-fetched Google Account ID: {}", accountId);
            } else {
                log.warn("⚠️  No account ID returned. User may have no Google Business accounts.");
            }
        } catch (Exception e) {
            log.error("❌ Failed to fetch Account ID: {}", e.getMessage(), e);
            // Don't throw - continue with other data
        }

        // ── Step 3: Fetch location ID automatically (first location)
        log.debug("Step 3: Fetching Location data...");
        String locationId = null;
        String businessName = null;
        String businessAddress = null;

        if (accountId != null) {
            try {
                JsonObject locationResult = fetchFirstLocation(rawAccessToken, accountId);
                if (locationResult != null) {
                    locationId = extractLocationId(locationResult);
                    businessName = locationResult.has("title")
                            ? locationResult.get("title").getAsString() : null;

                    if (locationResult.has("storefrontAddress")) {
                        JsonObject addr = locationResult.getAsJsonObject("storefrontAddress");
                        businessAddress = buildAddressString(addr);
                    }

                    log.info("✅ Auto-fetched Location ID: {}", locationId);
                    log.info("✅ Auto-fetched Business Name: {}", businessName);
                    log.info("✅ Auto-fetched Business Address: {}", businessAddress);
                } else {
                    log.warn("⚠️  No location found. Account {} may have no locations.", accountId);
                }
            } catch (Exception e) {
                log.error("❌ Failed to fetch Location data: {}", e.getMessage(), e);
                // Don't throw - continue
            }
        } else {
            log.warn("⚠️  Skipping location fetch - no account ID available");
        }

        // ── Step 4: Encrypt tokens and save everything to database
        log.debug("Step 4: Saving encrypted tokens and business data to database...");
        try {
            Client client = clientRepository.findById(clientDbId).orElseThrow(
                    () -> new RuntimeException("Client not found with ID: " + clientDbId));

            client.setGoogleAccessToken(encryptionUtil.encrypt(rawAccessToken));
            log.debug("✅ Encrypted and saved access token");

            if (rawRefreshToken != null) {
                client.setGoogleRefreshToken(encryptionUtil.encrypt(rawRefreshToken));
                log.debug("✅ Encrypted and saved refresh token");
            }

            client.setGoogleTokenExpiry(System.currentTimeMillis() + (expiresIn * 1000));
            log.debug("✅ Set token expiry to: {}", client.getGoogleTokenExpiry());

            if (accountId != null) {
                client.setGoogleAccountId(accountId);
                log.info("✅ Saved Account ID: {}", accountId);
            } else {
                log.warn("⚠️  Not saving Account ID (null)");
            }

            if (locationId != null) {
                client.setGoogleLocationId(locationId);
                log.info("✅ Saved Location ID: {}", locationId);
            } else {
                log.warn("⚠️  Not saving Location ID (null)");
            }

            if (businessName != null) {
                client.setGoogleBusinessName(businessName);
                log.info("✅ Saved Business Name: {}", businessName);
            } else {
                log.warn("⚠️  Not saving Business Name (null)");
            }

            if (businessAddress != null) {
                client.setGoogleBusinessAddress(businessAddress);
                log.info("✅ Saved Business Address: {}", businessAddress);
            } else {
                log.warn("⚠️  Not saving Business Address (null)");
            }

            clientRepository.save(client);
            log.info("═══ ✅ OAuth Exchange & Business Data Fetch COMPLETE ═══");
        } catch (Exception e) {
            log.error("❌ Failed to save client data: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to save client data", e);
        }
    }

    // ═══════════════════════════════════════════════════════════
    // TOKEN REFRESH
    // ═══════════════════════════════════════════════════════════

    public String refreshAccessToken(Client client) throws Exception {
        log.debug("Refreshing access token for client: {}", client.getId());

        String rawRefreshToken = encryptionUtil.decrypt(client.getGoogleRefreshToken());

        if (rawRefreshToken == null) {
            throw new RuntimeException("No refresh token available for client: " + client.getId());
        }

        String body = "client_id=" + clientId +
                "&client_secret=" + clientSecret +
                "&refresh_token=" + URLEncoder.encode(rawRefreshToken, "UTF-8") +
                "&grant_type=refresh_token";

        HttpResponse<String> response = post("https://oauth2.googleapis.com/token", body);

        if (response.statusCode() != 200) {
            log.error("❌ Token refresh failed with status {}: {}",
                    response.statusCode(), response.body());
            throw new RuntimeException("Token refresh failed: " + response.body());
        }

        log.debug("✅ Token refresh successful");
        JsonObject json = gson.fromJson(response.body(), JsonObject.class);
        String newRawToken = json.get("access_token").getAsString();
        long expiresIn = json.get("expires_in").getAsLong();

        client.setGoogleAccessToken(encryptionUtil.encrypt(newRawToken));
        client.setGoogleTokenExpiry(System.currentTimeMillis() + (expiresIn * 1000));
        clientRepository.save(client);

        log.info("✅ Access token refreshed and saved for client: {}", client.getId());
        return newRawToken; // Return raw (decrypted) for immediate use
    }

    /**
     * Always returns a valid RAW (decrypted) access token ready to use in API calls.
     */
    public String getValidAccessToken(Client client) throws Exception {
        long bufferMs = 5 * 60 * 1000; // 5 minute buffer

        if (client.getGoogleTokenExpiry() == null) {
            log.warn("⚠️  Client {} has no token expiry set", client.getId());
            throw new RuntimeException("No token expiry set for client: " + client.getId());
        }

        long now = System.currentTimeMillis();
        long expiresAt = client.getGoogleTokenExpiry();

        if (now > expiresAt - bufferMs) {
            log.info("Token expiring soon (within 5 min buffer). Refreshing...");
            return refreshAccessToken(client); // Returns raw token
        }

        log.debug("Token is still valid. Returns in: {} seconds",
                (expiresAt - now) / 1000);
        return encryptionUtil.decrypt(client.getGoogleAccessToken()); // Decrypt for use
    }

    // ═══════════════════════════════════════════════════════════
    // FETCH ACCOUNTS LIST — returns list of {accountId, accountName}
    // ═══════════════════════════════════════════════════════════

    public List<GoogleAccountDto> fetchAccountsList(String rawAccessToken) throws Exception {
        log.debug("Fetching accounts list with access token...");

        if (rawAccessToken == null || rawAccessToken.isEmpty()) {
            throw new RuntimeException("Access token is null or empty");
        }

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(ACCOUNTS_API))
                .header("Authorization", "Bearer " + rawAccessToken)
                .GET()
                .build();

        log.debug("Making request to: {}", ACCOUNTS_API);
        HttpResponse<String> response = HttpClient.newHttpClient()
                .send(request, HttpResponse.BodyHandlers.ofString());

        log.debug("Accounts API Response Status: {}", response.statusCode());

        List<GoogleAccountDto> accounts = new ArrayList<>();

        if (response.statusCode() != 200) {
            log.error("❌ Accounts API error {}: {}", response.statusCode(), response.body());
            // Log more details for debugging
            if (response.statusCode() == 403) {
                log.error("PERMISSION DENIED - Check if APIs are enabled in Google Cloud Console");
            } else if (response.statusCode() == 401) {
                log.error("UNAUTHORIZED - Token may be invalid or expired");
            }
            return accounts; // Return empty list
        }

        log.debug("Response body: {}", response.body());
        JsonObject body = gson.fromJson(response.body(), JsonObject.class);

        if (body == null) {
            log.warn("⚠️  Response body parsed to null");
            return accounts;
        }

        if (!body.has("accounts")) {
            log.warn("⚠️  No 'accounts' field in response");
            return accounts;
        }

        JsonArray accountsArray = body.getAsJsonArray("accounts");
        log.info("✅ Found {} accounts", accountsArray.size());

        for (JsonElement el : accountsArray) {
            JsonObject acc = el.getAsJsonObject();
            String name = acc.get("name").getAsString(); // "accounts/123456"
            String id = name.replace("accounts/", "");
            String displayName = acc.has("accountName")
                    ? acc.get("accountName").getAsString() : "Unknown";

            log.debug("  └─ Account: id={}, name={}", id, displayName);
            accounts.add(new GoogleAccountDto(id, displayName));
        }

        return accounts;
    }

    // ═══════════════════════════════════════════════════════════
    // FETCH LOCATIONS LIST — returns list of {locationId, title}
    // ═══════════════════════════════════════════════════════════

    public List<GoogleLocationDto> fetchLocationsList(String rawAccessToken,
                                                      String accountId) throws Exception {
        log.debug("Fetching locations for account: {}", accountId);

        if (rawAccessToken == null || rawAccessToken.isEmpty()) {
            throw new RuntimeException("Access token is null or empty");
        }

        if (accountId == null || accountId.isEmpty()) {
            throw new RuntimeException("Account ID is null or empty");
        }

        String url = String.format(LOCATIONS_API, accountId);
        log.debug("Making request to: {}", url);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Authorization", "Bearer " + rawAccessToken)
                .GET()
                .build();

        HttpResponse<String> response = HttpClient.newHttpClient()
                .send(request, HttpResponse.BodyHandlers.ofString());

        log.debug("Locations API Response Status: {}", response.statusCode());

        List<GoogleLocationDto> locations = new ArrayList<>();

        if (response.statusCode() != 200) {
            log.error("❌ Locations API error {}: {}", response.statusCode(), response.body());
            if (response.statusCode() == 403) {
                log.error("PERMISSION DENIED - Check if APIs are enabled in Google Cloud Console");
            } else if (response.statusCode() == 401) {
                log.error("UNAUTHORIZED - Token may be invalid or expired");
            } else if (response.statusCode() == 404) {
                log.error("NOT FOUND - Account may not exist: {}", accountId);
            }
            return locations; // Return empty list
        }

        log.debug("Response body: {}", response.body());
        JsonObject body = gson.fromJson(response.body(), JsonObject.class);

        if (body == null) {
            log.warn("⚠️  Response body parsed to null");
            return locations;
        }

        if (!body.has("locations")) {
            log.warn("⚠️  No 'locations' field in response. User may have no locations.");
            return locations;
        }

        JsonArray locationsArray = body.getAsJsonArray("locations");
        log.info("✅ Found {} locations in account {}", locationsArray.size(), accountId);

        for (JsonElement el : locationsArray) {
            JsonObject loc = el.getAsJsonObject();
            String name = loc.get("name").getAsString(); // "locations/987654"
            String id = name.replace("locations/", "");
            String title = loc.has("title")
                    ? loc.get("title").getAsString() : "Unknown Location";

            log.debug("  └─ Location: id={}, title={}", id, title);
            locations.add(new GoogleLocationDto(id, title));
        }

        return locations;
    }

    // ═══════════════════════════════════════════════════════════
    // PRIVATE HELPERS
    // ═══════════════════════════════════════════════════════════

    private String fetchAccountId(String rawAccessToken) throws Exception {
        try {
            List<GoogleAccountDto> accounts = fetchAccountsList(rawAccessToken);
            if (accounts.isEmpty()) {
                log.warn("⚠️  fetchAccountId: No accounts found in response");
                return null;
            }
            String id = accounts.get(0).getId();
            log.debug("fetchAccountId: Returning account ID: {}", id);
            return id;
        } catch (Exception e) {
            log.error("fetchAccountId: Exception occurred: {}", e.getMessage(), e);
            throw e;
        }
    }

    private JsonObject fetchFirstLocation(String rawAccessToken,
                                          String accountId) throws Exception {
        try {
            String url = String.format(LOCATIONS_API, accountId);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Authorization", "Bearer " + rawAccessToken)
                    .GET()
                    .build();

            HttpResponse<String> response = HttpClient.newHttpClient()
                    .send(request, HttpResponse.BodyHandlers.ofString());

            log.debug("fetchFirstLocation: API response status: {}", response.statusCode());

            if (response.statusCode() != 200) {
                log.error("fetchFirstLocation: API returned {}: {}",
                        response.statusCode(), response.body());
                return null;
            }

            JsonObject body = gson.fromJson(response.body(), JsonObject.class);
            if (body == null) {
                log.warn("fetchFirstLocation: Response body is null");
                return null;
            }

            if (!body.has("locations")) {
                log.warn("fetchFirstLocation: No 'locations' field in response");
                return null;
            }

            JsonArray locs = body.getAsJsonArray("locations");
            if (locs.size() == 0) {
                log.warn("fetchFirstLocation: Locations array is empty");
                return null;
            }

            JsonObject firstLocation = locs.get(0).getAsJsonObject();
            log.debug("fetchFirstLocation: Returning first location: {}",
                    firstLocation.get("name"));
            return firstLocation;
        } catch (Exception e) {
            log.error("fetchFirstLocation: Exception occurred: {}", e.getMessage(), e);
            throw e;
        }
    }

    private String extractLocationId(JsonObject location) {
        // Google returns "locations/987654321" — we store just "987654321"
        try {
            String name = location.get("name").getAsString();
            String id = name.replace("locations/", "");
            log.debug("extractLocationId: {} -> {}", name, id);
            return id;
        } catch (Exception e) {
            log.error("extractLocationId: Failed to extract from {}: {}", location, e.getMessage());
            return null;
        }
    }

    private String buildAddressString(JsonObject addr) {
        try {
            StringBuilder sb = new StringBuilder();
            if (addr.has("addressLines")) {
                for (JsonElement line : addr.getAsJsonArray("addressLines")) {
                    sb.append(line.getAsString()).append(", ");
                }
            }
            if (addr.has("locality")) sb.append(addr.get("locality").getAsString()).append(", ");
            if (addr.has("administrativeArea")) sb.append(addr.get("administrativeArea").getAsString());
            String result = sb.toString().replaceAll(",\\s*$", "").trim();
            log.debug("buildAddressString: {}", result);
            return result;
        } catch (Exception e) {
            log.error("buildAddressString: Failed to build address: {}", e.getMessage());
            return null;
        }
    }

    private HttpResponse<String> post(String url, String body) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
        return HttpClient.newHttpClient()
                .send(request, HttpResponse.BodyHandlers.ofString());
    }

    // ═══════════════════════════════════════════════════════════
    // DTOs
    // ═══════════════════════════════════════════════════════════

    public static class GoogleAccountDto {
        private final String id;
        private final String name;
        public GoogleAccountDto(String id, String name) { this.id = id; this.name = name; }
        public String getId()   { return id; }
        public String getName() { return name; }
    }

    public static class GoogleLocationDto {
        private final String id;
        private final String title;
        public GoogleLocationDto(String id, String title) { this.id = id; this.title = title; }
        public String getId()    { return id; }
        public String getTitle() { return title; }
    }
}