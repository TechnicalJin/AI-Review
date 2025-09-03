package com.yrhp.crud.service;

import com.yrhp.crud.model.Client;
import com.yrhp.crud.model.ReviewGenerationLog;
import com.yrhp.crud.repository.ClientRepository;
import com.yrhp.crud.repository.ReviewGenerationLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReviewGeneratorService {

    private static final Logger logger = LoggerFactory.getLogger(ReviewGeneratorService.class);

    @Autowired
    private ChatGPTService chatGPTService;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private ReviewGenerationLogRepository logRepository;

    /*
    private static final String[] DESCRIPTIVE_KEYWORDS = {
        "Perfect", "Highly recommended!", "Definitely worth it", "Exceptional quality", "Excellent service",
        "Top-notch experience", "Unmatched expertise", "Friendly staff", "Professional and courteous",
        "Outstanding customer service", "Seamless experience", "Absolutely fantastic", "Reliable and trustworthy",
        "Exceeded expectations", "Five-star experience", "Warm and welcoming", "Great attention to detail",
        "Remarkable craftsmanship", "Superior quality", "Simply amazing", "Prompt and efficient",
        "Great value for money", "Worth every penny", "Impressive selection", "Must-visit spot",
        "Attention to customer needs", "Hassle-free process", "Personalized experience", "Effortlessly stylish",
        "Innovative and creative", "Best in the industry", "True professionals", "Unparalleled service",
        "Smooth and enjoyable", "Fast and reliable", "Skilled and knowledgeable", "A hidden gem",
        "Well-curated selection", "Trustworthy and dependable", "Second to none", "Amazing variety",
        "Perfectly executed", "Comfortable and inviting", "Luxurious yet affordable", "Great ambiance",
        "A pleasure to visit", "Polite and attentive staff", "Carefully crafted", "Top-tier quality",
        "Customer-first approach", "Always a great choice", "Refreshing and unique", "Satisfaction guaranteed",
        "Thoughtfully designed", "Well-organized and efficient", "Simply the best", "Welcoming atmosphere",
        "Flawless execution", "Unbeatable experience", "Delightful and charming", "High standards of service",
        "Fantastic selection", "A class apart", "Convenient and stress-free", "A joy to experience",
        "Smooth transaction", "Worth recommending", "Undeniably excellent", "Unique and appealing",
        "A step above the rest", "Reliable and consistent", "Always a pleasure", "One-of-a-kind experience",
        "Stands out from the rest", "Carefully curated", "Efficient and quick", "Goes above and beyond",
        "Super accommodating", "A wonderful discovery", "A benchmark for excellence", "Outstanding value",
        "Trendy and fashionable", "Passionate about quality", "Well-thought-out offerings", "Truly impressive",
        "Makes a difference", "Quality meets affordability", "Pure perfection", "A cut above",
        "Thoughtful and innovative", "Elevated and refined", "Seamless and smooth", "A place you can trust",
        "Crafted with care", "The gold standard", "Perfectly balanced", "Authentic and genuine",
        "Consistently excellent", "Well worth the visit", "Impossible to beat", "Absolutely delightful",
        "Top-quality service", "Extremely satisfied", "A wonderful experience", "Refreshingly different",
        "Beyond expectations", "Highly efficient", "A true standout", "Incredible attention to detail",
        "Fantastic craftsmanship", "A game changer", "Easy and convenient", "Seamless interaction",
        "Perfectly tailored", "Rich selection", "Extremely accommodating", "A dream come true",
        "Full of charm", "Hassle-free experience", "Impressively smooth", "A must-try",
        "Wonderful atmosphere", "Love every bit of it", "Absolutely phenomenal", "One of the best",
        "Always a treat", "Professional yet friendly", "A joy to explore", "Rich in quality",
        "Well-deserved praise", "Made with passion", "Pure excellence", "Quick and responsive",
        "Attention to every detail", "Flawless quality", "Beyond words", "A true gem",
        "Bright and inviting", "Generous offerings", "Ideal for any occasion", "Nothing short of amazing",
        "Carefully crafted experience", "Perfect for everyone", "Unforgettable visit", "Crafted to perfection",
        "One-of-a-kind service", "Thoughtfully presented", "Comfort meets style", "Pure sophistication",
        "Remarkably enjoyable", "Genuine and trustworthy", "Spectacular in every way", "A real pleasure",
        "Every detail is perfect", "Creates a lasting impression", "Love the energy here", "You won't be disappointed",
        "Quality-driven approach", "Passionate and dedicated", "Makes you feel special", "Exceptionally well-done",
        "Full of positive vibes", "A beautiful experience", "Outstanding commitment", "Remarkable consistency",
        "Surpassed all expectations", "Feels like home", "Great first impression", "Smooth and seamless",
        "Unique and wonderful", "Elevates the experience", "You'll love it here", "Consistently outstanding",
        "Smart and stylish", "Fantastic from start to finish", "Delivers on every promise", "A breath of fresh air",
        "Best decision ever", "Instantly impressed", "Luxurious and refined", "Outstanding execution",
        "Never fails to impress", "So much to love", "Brightens your day", "A pleasant surprise",
        "Such a delight", "Worth every visit", "Totally worth it", "Friendly and engaging", "Smooth and flawless",
        "The perfect balance", "A remarkable journey", "A cut above the competition", "A joy to be part of",
        "Effortlessly elegant", "Stays true to its promise", "A welcoming environment", "Everything feels premium",
        "Made just right", "10/10 would recommend", "A place to remember", "Refreshingly honest",
        "Full of personality", "Premium in every way", "Built on trust", "Stands the test of time",
        "Always on point", "Classic and timeless", "An enjoyable treat", "Inspires confidence", "Made with care",
        "Exactly what you need", "Great taste and style", "Something for everyone", "No complaints at all",
        "All-around excellence", "Beautifully executed", "A wonderful addition", "Full of inspiration",
        "More than expected", "Instantly fell in love", "Well above average", "A truly rewarding experience",
        "A unique perspective", "The kind of place you remember", "Feels tailor-made", "Vibrant and exciting",
        "A fresh new favorite", "Never lets you down", "Easy to love", "Impossible to resist",
        "Always a pleasure", "Designed with customers in mind", "The experience speaks for itself",
        "Clearly a top choice", "Set apart from the rest", "Quality that speaks volumes", "A class of its own",
        "The perfect blend", "An instant classic", "Designed for perfection", "Filled with character",
        "Great vibes all around", "Instantly puts you at ease", "Elegant yet approachable",
        "The right choice every time", "Strikes the perfect balance", "Worth making a special trip",
        "Has everything you need", "Everything just clicks", "A truly special place", "Friendly and professional",
        "Always delivers", "Makes life better", "Impossible to forget", "Built with love", "Satisfies every need",
        "Always a top contender", "Trustworthy and honest", "A heartwarming experience",
        "Designed with excellence in mind", "A pleasure from start to finish", "Leaves a lasting impact",
        "Comfortable yet stylish", "A place to feel good", "You'll love coming back", "Sets a new standard",
        "Warm and inviting", "Expertly designed", "Delightful in every way", "Creates meaningful moments",
        "Always a good time", "Quality is evident", "A rewarding experience", "Incredibly well thought out",
        "Where comfort meets luxury", "Brilliantly executed", "A top recommendation", "Great for all occasions",
        "Brightens up your day", "Stylish and functional", "The definition of excellence", "A place that feels special",
        "Designed to impress", "Pure joy", "An instant favorite", "A flawless experience", "Surprising in the best way",
        "As good as it gets", "A stress-free choice", "The gold standard in its field", "True attention to detail",
        "No better place", "Hard to beat", "Simply can't go wrong", "Designed to perfection", "A major win",
        "A brilliant concept", "The best kind of experience", "An absolute joy"
    };
    

    private static final String[] POSITIVE_WORDS = {
            "Good", "Very good", "Excellent", "Amazing", "Fantastic", "Wonderful",
            "Superb", "Outstanding", "Impressive", "Exceptional", "Brilliant", "Perfect",
            "Great", "Awesome", "Marvelous", "Spectacular", "Tremendous", "Remarkable",
            "Incredible", "Fabulous", "Phenomenal", "Top-notch", "First-class", "Five-star",
            "Super", "Highly recommended", "Best", "Unmatched", "Unbeatable", "Superlative",
            "Terrific", "Splendid", "Glorious", "Stunning", "Breathtaking", "Magnificent",
            "Flawless", "Exquisite", "Delightful", "Enjoyable", "Pleasant", "Refreshing",
            "Satisfying", "Comfortable", "Luxurious", "Classy", "Charming", "Elegant",
            "Graceful", "Polished", "Refined", "Harmonious", "Seamless", "Smooth",
            "Effortless", "Easy", "Convenient", "Reliable", "Trustworthy", "Dependable",
            "Consistent", "Professional", "Expert", "Knowledgeable", "Skillful",
            "Competent", "Diligent", "Efficient", "Meticulous", "Precise", "Attentive",
            "Thorough", "Detail-oriented", "Customer-focused", "Service-oriented",
            "Friendly", "Welcoming", "Hospitable", "Kind", "Courteous", "Polite",
            "Respectful", "Accommodating", "Approachable", "Helpful", "Supportive",
            "Caring", "Genuine", "Authentic", "Heartwarming", "Uplifting", "Encouraging",
            "Inspiring", "Motivating", "Enlightening", "Engaging", "Entertaining",
            "Captivating", "Fascinating", "Thoughtful", "Creative", "Innovative",
            "Unique", "Distinctive", "Versatile", "Comprehensive", "Well-rounded",
            "Balanced", "Holistic", "Wholesome", "Reliable choice", "A must-try",
            "Never disappoints"
    };
    */

    private static final String[] TONE_MODIFIERS = {
        "enthusiastic and positive",
        "professional and detailed",
        "casual and friendly",
        "balanced and objective",
        "personal and heartfelt",
        "impressed and satisfied"
    };

    private static final String[] PERSPECTIVE_MODIFIERS = {
        "Having visited multiple times",
        "After my recent experience",
        "Based on my experience",
        "From my perspective",
        "In my opinion",
        "From what I've seen",
        "After trying their services",
        "Having been there recently",
        "Throughout my visits",
        "During my time here"
    };

    private static final String[] WRITING_STYLES = {
        "I noticed several standout features",
        "What really impressed me was",
        "I particularly appreciated",
        "A few things worth mentioning",
        "Some highlights include",
        "The main aspects that stood out",
        "What makes this place special is",
        "I was especially pleased with",
        "Notable points include",
        "Key things to mention"
    };

    private static final String[] EXPERIENCE_PHRASES = {
        "Thoughtfully designed", "Well-organized and efficient", "Simply the best", "Welcoming atmosphere",
        "Flawless execution", "Unbeatable experience", "Delightful and charming", "High standards of service",
        "Fantastic selection", "A class apart", "Convenient and stress-free", "A joy to experience",
        "Smooth transaction", "Worth recommending", "Undeniably excellent", "Unique and appealing",
        "A step above the rest", "Reliable and consistent", "Always a pleasure", "One-of-a-kind experience"
    };

//    private static final String[] PROMPTS = {
//        "Based on %s, %s: \"%s\". %s. Character limit: %d.",
//        "\"%s\" - %s. Focusing on: \"%s\". %s. Keep within %d characters.",
//        "Here's my take on %s: \"%s\". %s. %s. Limit to %d characters.",
//        "Sharing thoughts about %s. %s: \"%s\". %s. Maximum %d characters.",
//        "My experience with %s was noteworthy. %s: \"%s\". %s. Stay within %d characters.",
//        "Let me share about %s. %s. Key points: \"%s\". %s. Up to %d characters."
//    };

    // Modified prompts to emphasize primary tag
    private static final String[] PROMPTS_WITH_PRIMARY_FOCUS = {
            "Based on %s, %s: The standout feature is definitely \"%s\". This is what makes it special. Additionally, %s. %s. Character limit: %d.",
            "\"%s\" - %s. What impressed me most was \"%s\". This really sets it apart. Other notable aspects: \"%s\". %s. Keep within %d characters.",
            "Here's my take on %s: The main highlight is \"%s\". This is the core of the experience. %s: \"%s\". %s. Limit to %d characters.",
            "Sharing thoughts about %s. %s: What defines this place is \"%s\". This is the key attraction. Supporting elements include \"%s\". %s. Maximum %d characters.",
            "My experience with %s was noteworthy. %s: The primary focus should be on \"%s\". This is what makes it memorable. Other aspects: \"%s\". %s. Stay within %d characters.",
            "Let me share about %s. %s. The central theme is \"%s\". This is what truly matters. Additional points: \"%s\". %s. Up to %d characters."
    };

    private static final String[] ADDITIONAL_INSTRUCTIONS = {
        "Share genuine observations",
        "Focus on personal experience",
        "Highlight memorable moments",
        "Describe what stands out",
        "Express honest opinions",
        "Share meaningful details",
        "Mention specific experiences",
        "Include relevant observations",
        "Focus on authentic experiences",
        "Describe notable aspects"
    };

    public String generateReviewWithTags(int clientId, List<String> selectedTags, String reviewLength, boolean isRegenerated) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new IllegalArgumentException("Client not found"));

        // Store the used tags for this client
        List<String> trimmedTags = selectedTags.stream()
                .map(String::trim)
                .collect(Collectors.toList());
        lastUsedTagsMap.put(clientId, trimmedTags);

        Random random = new Random();

        // Set character limit based on review length
        int charLimit;
        switch (reviewLength.toLowerCase()) {
            case "short":
                charLimit = random.nextInt(100) + 30; // 30-130 characters
                break;
            case "medium":
                charLimit = random.nextInt(100) + 130; // 130-230 characters
                break;
            case "large":
                charLimit = random.nextInt(200) + 230; // 230-430 characters
                break;
            default:
                charLimit = random.nextInt(100) + 130; // default to medium
        }

        // Identify primary tag (first tag) and supporting tags
        String primaryTag = trimmedTags.get(0);
        List<String> supportingTags = new ArrayList<>();
        if (trimmedTags.size() > 1) {
            supportingTags = trimmedTags.subList(1, trimmedTags.size());
        }

        // Add experience phrases to supporting tags only
        addRandomElements(supportingTags, EXPERIENCE_PHRASES, 1, random);
        Collections.shuffle(supportingTags);

        // Randomize the order of elements in the prompt
        List<String> promptElements = new ArrayList<>();
        promptElements.add(PERSPECTIVE_MODIFIERS[random.nextInt(PERSPECTIVE_MODIFIERS.length)]);
        promptElements.add(WRITING_STYLES[random.nextInt(WRITING_STYLES.length)]);
        promptElements.add(ADDITIONAL_INSTRUCTIONS[random.nextInt(ADDITIONAL_INSTRUCTIONS.length)]);

        // Shuffle the elements to randomize their order
        Collections.shuffle(promptElements);

        String clientName = client.getName() != null ? client.getName() : "Unknown Client";
        String supportingTagsString = supportingTags.isEmpty() ? "excellent service" : String.join(", ", supportingTags);

        String promptTemplate = PROMPTS_WITH_PRIMARY_FOCUS[random.nextInt(PROMPTS_WITH_PRIMARY_FOCUS.length)];
        String prompt = String.format(promptTemplate,
                clientName,
                promptElements.get(0),
                primaryTag,
                supportingTagsString,
                promptElements.get(1),
                charLimit
        );

        String baseTags = String.join(", ", trimmedTags);
        saveGenerationLog(client.getName(), reviewLength, baseTags, isRegenerated);

        logger.info("---                                   ---");
        logger.info("Review Length: {}", reviewLength);
        logger.info("Character Limit: {}", charLimit);
        logger.info("Primary Tag (Main Focus): {}", primaryTag);
        logger.info("Supporting Tags: {}", supportingTags);
        logger.info("Generated Prompt: {}", prompt);
        logger.info("Used Tags for client {}: {}", clientId, trimmedTags);
        logger.info("---                                   ---");

        return chatGPTService.getResponse(prompt);
    }

    public String generateReviewWithTags(int clientId, List<String> selectedTags, String reviewLength) {
        return generateReviewWithTags(clientId, selectedTags, reviewLength, false);
    }

    // Helper method to add random elements from source array
    private void addRandomElements(List<String> target, String[] source, int count, Random random) {
        Set<String> selectedElements = new HashSet<>();
        while (selectedElements.size() < count) {
            selectedElements.add(source[random.nextInt(source.length)]);
        }
        target.addAll(selectedElements);
    }

    // Modify the original generateReview method with primary tag focus
    public String generateReview(int clientId, boolean isRegenerated) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new IllegalArgumentException("Client not found"));

        Random random = new Random();
        int charLimit = random.nextInt(471) + 30;

        String clientName = client.getName() != null ? client.getName() : "Unknown Client";
        String chatText = client.getChatText() != null ? client.getChatText() : "No details provided";

        List<String> baseTags = Arrays.asList(chatText.split(","));
        List<String> selectedBaseTags = random.ints(0, baseTags.size())
                .distinct()
                .limit(3)
                .mapToObj(baseTags::get)
                .map(String::trim) // Trim whitespace
                .collect(Collectors.toList());

        // Store the used tags for this client
        lastUsedTagsMap.put(clientId, selectedBaseTags);

        // Identify primary tag (first tag) and supporting tags
        String primaryTag = selectedBaseTags.get(0);
        List<String> supportingTags = new ArrayList<>();
        if (selectedBaseTags.size() > 1) {
            supportingTags = selectedBaseTags.subList(1, selectedBaseTags.size());
        }

        // Add experience phrases to supporting tags only
        addRandomElements(supportingTags, EXPERIENCE_PHRASES, 1, random);
        Collections.shuffle(supportingTags);

        // Randomize the order of elements in the prompt
        List<String> promptElements = new ArrayList<>();
        promptElements.add(PERSPECTIVE_MODIFIERS[random.nextInt(PERSPECTIVE_MODIFIERS.length)]);
        promptElements.add(WRITING_STYLES[random.nextInt(WRITING_STYLES.length)]);
        promptElements.add(ADDITIONAL_INSTRUCTIONS[random.nextInt(ADDITIONAL_INSTRUCTIONS.length)]);

        // Shuffle the elements to randomize their order
        Collections.shuffle(promptElements);

        String supportingTagsString = supportingTags.isEmpty() ? "excellent service" : String.join(", ", supportingTags);

        String promptTemplate = PROMPTS_WITH_PRIMARY_FOCUS[random.nextInt(PROMPTS_WITH_PRIMARY_FOCUS.length)];
        String prompt = String.format(promptTemplate,
                clientName,
                promptElements.get(0),
                primaryTag,
                supportingTagsString,
                promptElements.get(1),
                charLimit
        );

        String keyPoints = String.join(", ", baseTags);

        String reviewLengthCategory = determineReviewLengthCategory(charLimit);
        saveGenerationLog(client.getName(), reviewLengthCategory, keyPoints, isRegenerated);

        logger.info("---                                   ---");
        logger.info("Primary Tag (Main Focus): {}", primaryTag);
        logger.info("Supporting Tags: {}", supportingTags);
        logger.info("Generated Prompt: {}", prompt);
        logger.info("Used Tags for client {}: {}", clientId, selectedBaseTags);
        logger.info("---                                   ---");

        return chatGPTService.getResponse(prompt);
    }

    // Backward-compatible version
    public String generateReview(int clientId) {
        return generateReview(clientId, false);
    }

    private void saveGenerationLog(String companyName, String reviewLength,
                                   String keyPoints, boolean isRegenerated) {
        ReviewGenerationLog log = new ReviewGenerationLog();
        log.setCompanyName(companyName);
        log.setTimestamp(LocalDateTime.now());
        log.setReviewLength(reviewLength);
        log.setKeyPoints(keyPoints);
        log.setRegenerated(isRegenerated ? "yes" : "no");

        logRepository.save(log);

        logger.info("---                                   ---");
        logger.info("Saved generation log | Company: {} | Length: {} | Regenerated: {} | KeyPoints: {}",
                companyName, reviewLength, isRegenerated ? "yes" : "no", keyPoints);
    }

    private String determineReviewLengthCategory(int charLimit) {
        if (charLimit <= 130) {
            return "short";
        } else if (charLimit <= 230) {
            return "medium";
        } else {
            return "large";
        }
    }

    private Map<Integer, List<String>> lastUsedTagsMap = new HashMap<>();

    // New method to get last used tags for a client
    public List<String> getLastUsedTags(int clientId) {
        return lastUsedTagsMap.getOrDefault(clientId, new ArrayList<>());
    }

    // New method to get all available tags for a client
    public List<String> getAllAvailableTags(int clientId) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new IllegalArgumentException("Client not found"));

        String chatText = client.getChatText() != null ? client.getChatText() : "";
        return Arrays.stream(chatText.split(","))
                .map(String::trim)
                .filter(tag -> !tag.isEmpty())
                .collect(Collectors.toList());
    }
}