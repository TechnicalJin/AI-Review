# PROJECT TECHNICAL TOPICS DOCUMENTATION
## YRHP Review Generator - Complete Technical Analysis

**Document Type:** Technical Architecture & Design Patterns Catalog
**Project:** YRHP Review Generator - Spring Boot Application
**Date:** March 16, 2026
**Language:** Java 17
**Framework:** Spring Boot 3.2.3

---

## TABLE OF CONTENTS

1. Project Overview
2. Core Java Topics
3. Frameworks and Libraries
4. Security Topics
5. Backend Architecture Topics
6. Database Topics
7. API & Integration Topics
8. Configuration and Infrastructure Topics
9. Design Patterns
10. File-Based Evidence
11. Complete Topic List

---

## 1. PROJECT OVERVIEW

### Project Purpose
YRHP Review Generator is a **comprehensive SaaS (Software-as-a-Service) web application** designed to:
- Manage business reviews and client relationships
- Generate AI-powered review responses using OpenAI's GPT models
- Automate Google Business review management and auto-reply functionality
- Provide dual-role authentication (Admin users and Client users)
- Track review generation logs and automation metrics

### Application Type
**Full-Stack Web Application** with:
- Server-Side: Spring Boot backend (MVC architecture)
- Client-Side: Thymeleaf template engine (server-side rendering)
- Data Layer: MySQL 8.0 relational database
- Integration Layer: External APIs (OpenAI, Google Business APIs)

### Main Technologies Stack
```
Core Framework:    Spring Boot 3.2.3
Security:          Spring Security 6.x
ORM:               Spring Data JPA / Hibernate ORM
Template Engine:   Thymeleaf
Database:          MySQL 8.0
Build Tool:        Maven 3.x
Java Version:      Java 17 LTS
HTTP Client:       Apache HttpClient 5.3.1
JSON Library:      Gson 2.10.1
Serialization:     Jakarta XML Binding 4.0
Logging:           SLF4J with Logback
```

### Architecture Style
**Layered Architecture (N-Tier MVC Pattern):**
- **Controller Layer** - HTTP request handling and routing
- **Service Layer** - Business logic and orchestration
- **Repository Layer** - Data access abstraction (JPA/Hibernate)
- **Model/Entity Layer** - Data domain objects
- **Configuration Layer** - Spring beans and application setup

### Key Features
1. **Dual Authentication System**: Admin users + Client users
2. **Google OAuth2 Integration**: Two-tier OAuth authorization
3. **AI-Powered Review Generation**: OpenAI ChatGPT integration
4. **Scheduled Tasks**: Automatic review processing every 5 minutes
5. **File Upload Management**: Client logos and assets
6. **Role-Based Access Control**: ROLE_USER and ROLE_CLIENT separation

---

## 2. CORE JAVA TOPICS USED

### 2.1 Object-Oriented Programming (OOP) Concepts

#### 2.1.1 Encapsulation
**Definition:** Bundling data and methods together while hiding internal details.

**Implementation:**
- All entity models use private fields with public getter/setter methods
- Service classes encapsulate business logic behind public method signatures
- Custom exceptions encapsulate error information

**Files:**
- `src/main/java/com/yrhp/crud/model/Client.java` - Entity with private fields
- `src/main/java/com/yrhp/crud/model/UserDtls.java` - User entity
- `src/main/java/com/yrhp/crud/service/ClientService.java` - Business logic encapsulation

**Code Example:**
```java
@Entity
@Table(name = "clients")
public class Client {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Column(unique = true)
    private String email;

    private String password;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
```

#### 2.1.2 Inheritance
**Definition:** Classes inheriting behavior from parent classes.

**Implementations:**
1. **JPA Repository Inheritance:**
   - Repositories extend `JpaRepository<T, ID>`
   - Automatic CRUD and query methods provided by Spring Data

2. **Spring Security Interface Implementation:**
   - `CustomUserDetails` implements `org.springframework.security.core.userdetails.UserDetails`

3. **Exception Hierarchy:**
   - `OpenAIException extends RuntimeException`
   - `ResourceNotFoundException extends RuntimeException`

**Files:**
- `src/main/java/com/yrhp/crud/repository/ClientRepository.java` - extends JpaRepository
- `src/main/java/com/yrhp/crud/config/CustomUserDetails.java` - implements UserDetails
- `src/main/java/com/yrhp/crud/exception/OpenAIException.java` - extends RuntimeException

**Code Example:**
```java
@Repository
public interface ClientRepository extends JpaRepository<Client, Integer> {
    Optional<Client> findByEmail(String email);
    List<Client> findByName(String name);
}

public class CustomUserDetails implements UserDetails {
    private UserDtls user;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority(user.getRole());
        return Arrays.asList(authority);
    }
}
```

#### 2.1.3 Polymorphism
**Definition:** Objects taking multiple forms and methods responding polymorphically.

**Implementations:**
1. **Spring Bean Polymorphism:**
   - `UserDetailsService` interface with multiple implementations
   - `PasswordEncoder` bean (BCryptPasswordEncoder implementation)

2. **HTTP Method Overloading:**
   - Same endpoint responding to different HTTP methods (GET, POST)

3. **Exception Handling:**
   - Global exception handler responding to different exception types

**Files:**
- `src/main/java/com/yrhp/crud/service/UserDetailsServiceImpl.java` - implements UserDetailsService
- `src/main/java/com/yrhp/crud/exception/GlobalExceptionHandler.java` - polymorphic exception handling
- `src/main/java/com/yrhp/crud/config/SecurityConfig.java` - BCryptPasswordEncoder polymorphism

**Code Example:**
```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleResourceNotFoundException(ResourceNotFoundException ex) {
        // Handle specific exception type
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<?> handleDataAccessException(DataAccessException ex) {
        // Handle different exception type
    }
}
```

#### 2.1.4 Abstraction
**Definition:** Hiding complexity and exposing only necessary interfaces.

**Implementations:**
1. **Repository Pattern:** Abstract data access details
2. **Service Layer:** Abstract business logic from controllers
3. **Configuration Classes:** Abstract Spring bean setup
4. **Interfaces:** UserDetailsService, PasswordEncoder

**Files:**
- `src/main/java/com/yrhp/crud/service/` - Service layer abstraction
- `src/main/java/com/yrhp/crud/repository/` - Repository abstraction
- `src/main/java/com/yrhp/crud/config/SecurityConfig.java` - Configuration abstraction

---

### 2.2 Interfaces

#### 2.2.1 Spring Security Interfaces
**Files:**
- `src/main/java/com/yrhp/crud/config/CustomUserDetails.java`
  - Implements: `org.springframework.security.core.userdetails.UserDetails`
  - Methods: `getAuthorities()`, `getPassword()`, `getUsername()`

#### 2.2.2 Spring Data Interfaces
**Files:**
- `src/main/java/com/yrhp/crud/repository/ClientRepository.java`
  - Extends: `JpaRepository<Client, Integer>`
  - Provides: automatic CRUD operations

#### 2.2.3 Spring MVC Interfaces
**Files:**
- `src/main/java/com/yrhp/crud/config/WebConfig.java` (commented)
  - Implements: `WebMvcConfigurer`
  - For customizing MVC configuration

---

### 2.3 Abstract Classes

None directly implemented, but framework uses abstract base classes:
- Spring's `ControllerAdvice` (abstract for exception handling)
- Spring's `Component` (abstract for component scanning)

---

### 2.4 Exception Handling

#### 2.4.1 Custom Exception Classes
**Files:**
1. `src/main/java/com/yrhp/crud/exception/OpenAIException.java`
   ```java
   public class OpenAIException extends RuntimeException {
       public OpenAIException(String message) { super(message); }
       public OpenAIException(String message, Throwable cause) { super(message, cause); }
   }
   ```

2. `src/main/java/com/yrhp/crud/exception/ResourceNotFoundException.java`

#### 2.4.2 Global Exception Handler
**File:** `src/main/java/com/yrhp/crud/exception/GlobalExceptionHandler.java`

**Exception Types Handled:**
- `ResourceNotFoundException` → HTTP 404
- `IllegalArgumentException` → HTTP 400
- `MaxUploadSizeExceededException` → HTTP 400
- `MethodArgumentNotValidException` → HTTP 400 with validation details
- `DataAccessException` → HTTP 500 with generic message
- `TransactionException` → HTTP 500
- `OpenAIException` → HTTP 503
- `RuntimeException` → HTTP 500
- Generic `Exception` → HTTP 500

**Code Example:**
```java
@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<?> handleDataAccessException(DataAccessException ex) {
        log.error("Database error: {}", ex.getMessage(), ex);
        ErrorResponse error = new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "Database error occurred. Please try again later.");
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(OpenAIException.class)
    public ResponseEntity<String> handleOpenAIException(OpenAIException e) {
        log.error("OpenAI service error: {}", e.getMessage(), e);
        return ResponseEntity
            .status(HttpStatus.SERVICE_UNAVAILABLE)
            .body("AI service is temporarily unavailable: " + e.getMessage());
    }
}
```

#### 2.4.3 Try-Catch-Finally Patterns
**Files:**
- `src/main/java/com/yrhp/crud/service/ChatGPTService.java` - IOException handling
- `src/main/java/com/yrhp/crud/service/ClientService.java` - IOException and Exception handling
- `src/main/java/com/yrhp/crud/controller/HomeController.java` - Exception wrapping

---

### 2.5 Collections Framework

#### 2.5.1 List Usage
**Files:**
- `src/main/java/com/yrhp/crud/request/ChatGPTRequest.java` - List<ChatGPTMessage>
- `src/main/java/com/yrhp/crud/response/ChatGPTResponse.java` - List<ChatGPTChoice>
- `src/main/java/com/yrhp/crud/repository/ClientRepository.java` - List<Client>

**Code Example:**
```java
public class ChatGPTRequest {
    @NotEmpty(message = "Messages list cannot be empty")
    private List<ChatGPTMessage> messages;

    public void setMessages(String messages) {
        this.messages = Arrays.asList(new ChatGPTMessage("user", messages));
    }
}
```

#### 2.5.2 Optional Usage
**Files:**
- `src/main/java/com/yrhp/crud/repository/ClientRepository.java`
  - `Optional<Client> findByEmail(String email)`
  - `Optional<Client> findByMobile(String mobile)`
  - `Optional<Client> findById(int id)`

**Code Example:**
```java
public interface ClientRepository extends JpaRepository<Client, Integer> {
    Optional<Client> findByEmail(String email);
    Optional<Client> findByMobile(String mobile);
}
```

#### 2.5.3 Map Usage
**Files:**
- `src/main/java/com/yrhp/crud/controller/ClientController.java`
  - `Map<String, String> headers` for response building

**Code Example:**
```java
Map.Entry.comparingByValue()  // Stream API with Map operations
```

#### 2.5.4 Array Usage
**Files:**
- `src/main/java/com/yrhp/crud/config/CustomUserDetails.java`
  - `Arrays.asList(simpleGrantedAuthority)` for converting authorities

---

### 2.6 Streams & Lambda Expressions

#### 2.6.1 Stream API Usage
**File:** `src/main/java/com/yrhp/crud/controller/ClientController.java`

**Code Example:**
```java
String avgReviewLength = logs.stream()
    .map(ReviewGenerationLog::getReviewLength)
    .filter(Objects::nonNull)
    .collect(Collectors.groupingBy(
        length -> length,
        Collectors.counting()
    ))
    .entrySet().stream()
    .max(Map.Entry.comparingByValue())
    .map(Map.Entry::getKey)
    .orElse("N/A");

LocalDateTime lastReviewTimestamp = logs.stream()
    .map(ReviewGenerationLog::getTimestamp)
    .filter(Objects::nonNull)
    .max(LocalDateTime::compareTo)
    .orElse(null);
```

#### 2.6.2 Lambda Expressions
**Files:**
- `src/main/java/com/yrhp/crud/config/SecurityConfig.java`
  ```java
  .authorizeHttpRequests(auth -> { auth.requestMatchers("/").permitAll(); })
  .formLogin(form -> { form.loginPage("/signin"); })
  .logout(logout -> { logout.logoutUrl("/logout"); })
  ```

- `src/main/java/com/yrhp/crud/exception/GlobalExceptionHandler.java`
  ```java
  ex.getBindingResult().getAllErrors().forEach((error) -> {
      String fieldName = ((FieldError) error).getField();
      String errorMessage = error.getDefaultMessage();
      errors.put(fieldName, errorMessage);
  });
  ```

#### 2.6.3 Method References
**Files:**
- `src/main/java/com/yrhp/crud/controller/ClientController.java`
  - `ReviewGenerationLog::getReviewLength` - method reference
  - `LocalDateTime::compareTo` - method reference bound to instances

---

### 2.7 Multithreading & Concurrency

#### 2.7.1 Scheduled Tasks
**File:** `src/main/java/com/yrhp/crud/google/GoogleReviewScheduler.java`

```java
@Component
public class GoogleReviewScheduler {

    // Runs every 5 minutes (300000 ms) with 1 minute initial delay
    @Scheduled(fixedDelay = 300000, initialDelay = 60000)
    public void runAutoReply() {
        log.info("Scheduler: starting Google auto-reply run");
        try {
            autoReplyService.processAllClients();
        } catch (Exception e) {
            log.error("Scheduler error: {}", e.getMessage(), e);
        }
    }
}
```

#### 2.7.2 Application Scheduling Configuration
**File:** `src/main/java/com/yrhp/crud/Application.java`

```java
@SpringBootApplication
@EnableScheduling  // Enables @Scheduled support
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

#### 2.7.3 HTTP Client Concurrency
**File:** `src/main/java/com/yrhp/crud/service/ChatGPTService.java`

```java
try (CloseableHttpClient httpClient = HttpClients.custom()
        .setDefaultRequestConfig(requestConfig)
        .build()) {
    return httpClient.execute(post, response -> {
        // Lambda-based HTTP response handler
        return processResponse(response);
    });
}
```

**Thread Safety Mechanisms:**
- Spring manages thread-safe bean creation
- Try-with-resources ensures proper resource cleanup
- HttpClient manages connection pooling internally

---

### 2.8 Design Patterns Used

*See Section 9 for detailed design pattern analysis*

---

## 3. FRAMEWORKS AND LIBRARIES

### 3.1 Spring Boot Framework

#### 3.1.1 Spring Boot Auto-Configuration
**Concept:** Automatically configures Spring application based on jar dependencies.

**Implementation:**
- `spring-boot-starter-data-jpa` - Auto-configures JPA/Hibernate
- `spring-boot-starter-security` - Auto-configures Spring Security
- `spring-boot-starter-web` - Auto-configures Spring MVC
- `spring-boot-starter-thymeleaf` - Auto-configures Thymeleaf

**File:** `pom.xml` (lines 34-49)

#### 3.1.2 Spring Boot Application Entry Point
**File:** `src/main/java/com/yrhp/crud/Application.java`

```java
@SpringBootApplication  // Combines @Configuration, @ComponentScan, @EnableAutoConfiguration
@EnableScheduling       // Enables scheduled task support
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

#### 3.1.3 Embedded Tomcat Server
**Configuration:** Spring Boot embeds Apache Tomcat servlet container
- Auto-configured on port 8080
- HTTPS redirection in production via `HttpsRedirectConfig`

---

### 3.2 Spring Security Framework

#### 3.2.1 Spring Security Components
**File:** `src/main/java/com/yrhp/crud/config/SecurityConfig.java`

**Components:**
1. **PasswordEncoder**
   ```java
   @Bean
   public PasswordEncoder passwordEncoder() {
       return new BCryptPasswordEncoder();
   }
   ```

2. **DaoAuthenticationProvider**
   ```java
   @Bean
   public DaoAuthenticationProvider getDaoAuthProvider() {
       DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
       provider.setUserDetailsService(userDetailsService);
       provider.setPasswordEncoder(passwordEncoder());
       return provider;
   }
   ```

3. **SecurityFilterChain**
   ```java
   @Bean
   public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
       http
           .authenticationProvider(getDaoAuthProvider())
           .authorizeHttpRequests(...)
           .formLogin(...)
           .logout(...)
           .headers(...)
           .csrf(...);
       return http.build();
   }
   ```

#### 3.2.2 Authentication & Authorization
**Features:**
- Form-based login (username/email + password)
- Password encoder (BCrypt with adaptive rounds)
- Role-based access control (ROLE_USER, ROLE_CLIENT)
- Method-level security (@PreAuthorize)
- Session management (JSESSIONID)
- Logout with session invalidation

#### 3.2.3 Security Filters
**Applied:**
- Authentication filter (form login)
- Authorization filter (request matcher rules)
- Exception translation filter (error handling)
- CSRF filter (disabled with warning)
- Security headers filter (X-Frame-Options, HSTS, etc.)

---

### 3.3 Spring MVC Framework

#### 3.3.1 Controllers
**Files:**
1. `src/main/java/com/yrhp/crud/controller/HomeController.java`
   - Routes: `/signin`, `/register`, `/createUser`, `/`
   - Methods: GET (form display), POST (form submission)

2. `src/main/java/com/yrhp/crud/controller/ClientController.java`
   - Routes: `/client/**`
   - Methods: GET (home, profile), POST (actions)
   - Security: @PreAuthorize("hasRole('CLIENT')")

3. `src/main/java/com/yrhp/crud/controller/UserController.java`
   - Routes: `/user/**`
   - Methods: Mixed GET/POST/DELETE for CRUD operations
   - Security: @PreAuthorize("hasRole('USER')")

4. `src/main/java/com/yrhp/crud/controller/ChatTextController.java`
   - Routes: `/chattext/**`
   - Purpose: Review generation endpoints

5. `src/main/java/com/yrhp/crud/google/GoogleOAuthController.java`
   - Routes: `/user/google/`, `/client/google/`
   - Purpose: OAuth2 callback handling and configuration

#### 3.3.2 Request Mapping Annotations
**Types Used:**
- `@GetMapping` - For GET request handling
- `@PostMapping` - For POST request handling
- `@RequestMapping` - For class-level path prefix
- `@PathVariable` - For URL path parameters
- `@RequestParam` - For query string parameters
- `@ModelAttribute` - For form object binding
- `@RequestBody` - For JSON request body (implicit in REST endpoints)

**Example:**
```java
@GetMapping("/home")
@PreAuthorize("hasRole('CLIENT')")
public String home(Model model, Authentication authentication) { }

@PostMapping("/createUser")
public String createUser(@Valid @ModelAttribute("user") UserDtls user,
                         BindingResult result,
                         Model model,
                         HttpSession session) { }

@GetMapping("/user/google/settings/{clientId}")
public String adminGoogleSettings(@PathVariable int clientId, Model model) { }
```

#### 3.3.3 Model & View Pattern
**Purpose:** Pass data from controller to Thymeleaf templates

**Files:**
- Controllers add attributes to `Model` object
- Thymeleaf templates access model attributes
- Auto-redirect with data using `RedirectAttributes`

**Code Example:**
```java
@GetMapping("/register")
public String register(Model model, HttpSession session) {
    model.addAttribute("user", new UserDtls());
    String message = (String) session.getAttribute("msg");
    if (message != null) {
        model.addAttribute("msg", message);
        session.removeAttribute("msg");
    }
    return "register";  // Maps to templates/register.html
}
```

---

### 3.4 Spring Data JPA

#### 3.4.1 JpaRepository Interface
**Repositories:**
1. `src/main/java/com/yrhp/crud/repository/ClientRepository.java`
   - Extends: `JpaRepository<Client, Integer>`
   - Custom methods: `findByEmail()`, `findByMobile()`, `findByName()`, `findByGenerateLink()`, `existsByEmail()`, `findByAutoReplyEnabledTrue()`

2. `src/main/java/com/yrhp/crud/repository/UserRepository.java`
   - Extends: `JpaRepository<UserDtls, Integer>`
   - Custom methods: `findByEmail()`, `existsByEmail()`

3. `src/main/java/com/yrhp/crud/repository/ReviewGenerationLogRepository.java`
   - Extends: `JpaRepository<ReviewGenerationLog, Integer>`
   - Custom methods: `findByCompanyName()`, `findByTimestampBetween()`

4. `src/main/java/com/yrhp/crud/repository/GoogleReplyLogRepository.java`
   - Extends: `JpaRepository<GoogleReplyLog, Long>`
   - Custom methods: `findByClientIdOrderByRepliedAtDesc()`

#### 3.4.2 Query Methods
**Derived Query Methods:**
```java
public interface ClientRepository extends JpaRepository<Client, Integer> {
    // Derived from method name - Spring generates query
    List<Client> findByName(String name);
    Optional<Client> findByEmail(String email);
    Optional<Client> findByMobile(String mobile);
    boolean existsByEmail(String email);

    // Complex derived query with multiple conditions
    Page<Client> findByNameContainingIgnoreCaseOrMobileContainingOrEmailContainingIgnoreCase(
        String name, String mobile, String email, Pageable pageable);
}
```

#### 3.4.3 Pagination Support
**Files:**
- `src/main/java/com/yrhp/crud/repository/ClientRepository.java`

**Usage:**
```java
Page<Client> findByNameContainingIgnoreCaseOrMobileContainingOrEmailContainingIgnoreCase(
    String name, String mobile, String email, Pageable pageable);

// Called with: Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(...));
```

---

### 3.5 Hibernate ORM

#### 3.5.1 JPA Entity Annotations
**Files:** `src/main/java/com/yrhp/crud/model/`

**Entity Classes:**
1. `Client.java` - Business client entity
2. `UserDtls.java` - Admin/user entity
3. `ReviewGenerationLog.java` - Audit log entity
4. `GoogleReplyLog.java` - Google review log entity

**Annotations Used:**
```java
@Entity              // Marks class as JPA entity
@Table(name = "")    // Specifies database table name
@Id                  // Primary key
@GeneratedValue      // Auto-increment strategy
@Column              // Column-specific configuration
@NotBlank            // Jakarta validation
@Email               // Jakarta validation
@Pattern             // Jakarta validation with regex
@Size                // Jakarta validation with min/max
@Unique              // Database unique constraint (via @Column.unique)
@OneToMany           // (if used) One-to-many relationship
@ManyToOne           // (if used) Many-to-one relationship
```

#### 3.5.2 Mapping Configuration
**Example from Client.java:**
```java
@Entity
@Table(name = "clients")
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Column(unique = true)
    private String email;

    @Column(name = "google_access_token", columnDefinition = "TEXT")
    private String googleAccessToken;

    @Column(nullable = false)
    private String role = "ROLE_CLIENT";
}
```

#### 3.5.3 Hibernate Configuration
**File:** `src/main/resources/application.properties` (lines 10-16)

```properties
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://192.168.29.150:3306/review_generator
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.show-sql=false
spring.jpa.hibernate.ddl-auto=update  # Auto schema update
```

---

### 3.6 Thymeleaf Template Engine

#### 3.6.1 Template Configuration
**File:** `src/main/resources/application.properties` (lines 57-58)

```properties
spring.thymeleaf.prefix=classpath:/templates/
spring.thymeleaf.suffix=.html
```

#### 3.6.2 Templates
**Template Files:**
1. `src/main/resources/templates/login.html` - Login form
2. `src/main/resources/templates/register.html` - Registration form
3. `src/main/resources/templates/base.html` - Base template
4. `src/main/resources/templates/client/clientHome.html` - Client dashboard
5. `src/main/resources/templates/user/home.html` - Admin/user dashboard
6. `src/main/resources/templates/client/client-google-connect.html` - Google OAuth setup
7. `src/main/resources/templates/error/404.html` - Error page

#### 3.6.3 Spring Security Integration
**File:** `pom.xml` (lines 51-53)

```xml
<dependency>
    <groupId>org.thymeleaf.extras</groupId>
    <artifactId>thymeleaf-extras-springsecurity6</artifactId>
</dependency>
```

**Usage in Templates:**
- `sec:authorize` - Conditional rendering based on authentication
- `sec:authentication` - Access authenticated user details
- `th:if` conditional rendering
- `th:each` for loops
- `th:text`, `th:value` for variable binding

---

### 3.7 Lombok Framework

#### 3.7.1 Lombok Annotations
**File:** `pom.xml` (lines 67-70)

```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>
```

#### 3.7.2 Usage
**Files:**
- `src/main/java/com/yrhp/crud/request/ChatGPTRequest.java`
  ```java
  @Data  // Generates getters, setters, equals, hashCode, toString
  public class ChatGPTRequest {
      @NotBlank(message = "Model name cannot be blank")
      private String model = "gpt-4o-mini";

      @NotEmpty(message = "Messages list cannot be empty")
      private List<ChatGPTMessage> messages;
  }
  ```

- `src/main/java/com/yrhp/crud/response/ChatGPTResponse.java`
  ```java
  @Data
  public class ChatGPTResponse {
      private List<ChatGPTChoice> choices;
  }
  ```

#### 3.7.3 Annotations Provided
- `@Data` - Generates getters, setters, equals, hashCode, toString
- `@Getter` - Generates getters only
- `@Setter` - Generates setters only
- `@AllArgsConstructor` - Generates constructor with all fields
- `@NoArgsConstructor` - Generates no-arg constructor
- `@Builder` - Generates builder pattern (if used)

---

### 3.8 Jakarta Bean Validation Framework

#### 3.8.1 Validation Annotations
**Dependency:** `spring-boot-starter-validation` (pom.xml line 44)

**Annotations Used:**
1. `@NotBlank` - String must not be blank
2. `@NotEmpty` - Collection/String must not be empty
3. `@Email` - Valid email format
4. `@Pattern` - Matches regex pattern
5. `@Size` - Length validation (min/max)
6. `@Min` - Numeric minimum value
7. `@Max` - Numeric maximum value

**Example from Client.java:**
```java
@NotBlank(message = "Email is required")
@Email(message = "Invalid email format")
@Column(unique = true)
private String email;

@NotBlank(message = "Mobile number is required")
@Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Invalid mobile number format")
@Column(unique = true)
private String mobile;

@NotEmpty(message = "Review link is required")
@Pattern(regexp = "^(http(s)?://)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]...$")
private String reviewLink;
```

#### 3.8.2 Form Validation in Controllers
**File:** `src/main/java/com/yrhp/crud/controller/HomeController.java` (lines 54-55)

```java
@PostMapping("/createUser")
public String createUser(@Valid @ModelAttribute("user") UserDtls user,
                         BindingResult result,
                         Model model,
                         HttpSession session) {
    if (result.hasErrors()) {
        log.warn("Validation errors in user creation: {}", result.getAllErrors());
        return "register";  // Return to form with validation errors
    }
    // Process valid form data
}
```

---

### 3.9 Logging Framework (SLF4J & Logback)

#### 3.9.1 SLF4J Configuration
**Dependency:** Spring Boot provides by default

**Usage Pattern:**
```java
private static final Logger logger = LoggerFactory.getLogger(ClassName.class);

logger.info("Information message");
logger.error("Error message: {}", errorDetails);
logger.debug("Debug message with exception", exception);
logger.warn("Warning message");
```

#### 3.9.2 Logging Configuration
**File:** `src/main/resources/application.properties` (lines 43-50)

```properties
logging.level.org.springframework.security=INFO
logging.level.com.yrhp.crud.service=INFO
logging.level.org.hibernate.SQL=ERROR
logging.level.org.springframework.web=INFO
logging.level.com.yrhp.crud.service.ClientService=DEBUG
```

#### 3.9.3 Logback Configuration (Optional)
**File:** `src/main/resources/logback-spring.xml`
- Used for XML-based logging configuration
- Profile-specific logging setup

#### 3.9.4 Logging Examples
**Files using logging:**
1. `SecurityConfig.java` - Security configuration logging
2. `GlobalExceptionHandler.java` - Exception logging
3. `ChatGPTService.java` - API call logging
4. `ClientService.java` - Business logic logging
5. All service classes - Transactional logging

---

### 3.10 External Libraries

#### 3.10.1 Gson - JSON Processing
**Dependency:** `pom.xml` (lines 92-96)

```xml
<dependency>
    <groupId>com.google.code.gson</groupId>
    <artifactId>gson</artifactId>
    <version>2.10.1</version>
</dependency>
```

**Usage:**
- `src/main/java/com/yrhp/crud/service/ChatGPTService.java`
  ```java
  Gson gson = new Gson();
  String body = gson.toJson(chatGPTRequest);
  ChatGPTResponse response = gson.fromJson(responseBody, ChatGPTResponse.class);
  ```

- `src/main/java/com/yrhp/crud/google/GoogleOAuthService.java`
  ```java
  private final Gson gson = new Gson();
  JsonObject jsonResponse = gson.fromJson(responseBody, JsonObject.class);
  ```

#### 3.10.2 Apache HttpClient 5
**Dependency:** `pom.xml` (lines 109-113)

```xml
<dependency>
    <groupId>org.apache.httpcomponents.client5</groupId>
    <artifactId>httpclient5</artifactId>
    <version>5.3.1</version>
</dependency>
```

**Usage:**
- `src/main/java/com/yrhp/crud/service/ChatGPTService.java`
  ```java
  HttpPost post = new HttpPost(OPEN_AI_URL);
  post.setHeader("Content-Type", "application/json");
  post.setHeader("Authorization", "Bearer " + OPEN_AI_KEY);

  RequestConfig requestConfig = RequestConfig.custom()
      .setConnectTimeout(TIMEOUT, TimeUnit.SECONDS)
      .setResponseTimeout(TIMEOUT, TimeUnit.SECONDS)
      .build();

  try (CloseableHttpClient httpClient = HttpClients.custom()
          .setDefaultRequestConfig(requestConfig)
          .build()) {
      return httpClient.execute(post, response -> { ... });
  }
  ```

#### 3.10.3 Jakarta XML Binding (JAXB)
**Dependency:** `pom.xml` (lines 98-106)

```xml
<dependency>
    <groupId>jakarta.xml.bind</groupId>
    <artifactId>jakarta.xml.bind-api</artifactId>
    <version>4.0.1</version>
</dependency>
<dependency>
    <groupId>org.glassfish.jaxb</groupId>
    <artifactId>jaxb-runtime</artifactId>
    <version>4.0.2</version>
</dependency>
```

**Purpose:** XML serialization/deserialization support (if needed)

#### 3.10.4 MySQL Connector
**Dependency:** `pom.xml` (lines 62-65)

```xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```

**Purpose:** JDBC driver for MySQL 8.0 database connectivity

---

## 4. SECURITY TOPICS IMPLEMENTED

### 4.1 Authentication Mechanisms

#### 4.1.1 Form-Based Authentication
**File:** `src/main/java/com/yrhp/crud/config/SecurityConfig.java` (lines 81-106)

**Implementation:**
```java
.formLogin(form -> {
    logger.debug("Configuring form login");
    form.loginPage("/signin")
        .loginProcessingUrl("/signin")
        .defaultSuccessUrl("/", true)
        .successHandler((request, response, authentication) -> {
            String role = authentication.getAuthorities().iterator().next().getAuthority();
            logger.info("User logged in with role: {}", role);

            if ("ROLE_USER".equals(role)) {
                response.sendRedirect("/user/home");
            } else if ("ROLE_CLIENT".equals(role)) {
                response.sendRedirect("/client/home");
            }
        })
        .failureHandler((request, response, exception) -> {
            logger.error("Login failed: {}", exception.getMessage());
            response.sendRedirect("/signin?error=true");
        })
        .permitAll();
})
```

**Login Flow:**
1. User submits credentials at `/signin`
2. Spring Security intercepts POST request
3. DaoAuthenticationProvider validates credentials
4. UserDetailsServiceImpl loads user from database
5. BCrypt password comparison
6. Success handler redirects based on role
7. Failure handler shows error message

#### 4.1.2 Google OAuth2 Authentication
**Files:**
1. `src/main/java/com/yrhp/crud/google/GoogleOAuthService.java`
2. `src/main/java/com/yrhp/crud/google/GoogleOAuthController.java`
3. `src/main/java/com/yrhp/crud/google/TokenEncryptionUtil.java`

**OAuth2 Flow:**
1. **Authorization URL Building:**
   ```java
   public String buildAuthorizationUrl(int clientDbId) {
       return "https://accounts.google.com/o/oauth2/v2/auth" +
               "?client_id=" + clientId +
               "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8) +
               "&response_type=code" +
               "&scope=" + URLEncoder.encode("https://www.googleapis.com/auth/business.manage", ...) +
               "&access_type=offline" +
               "&prompt=consent" +
               "&state=" + state;  // CSRF protection
   }
   ```

2. **Code Exchange:**
   ```java
   public void exchangeCodeAndFetchBusinessData(String code, int clientDbId, boolean isClientCallback) {
       // Exchange auth code for access + refresh tokens
       // Fetch business account and location IDs
       // Encrypt and persist tokens
   }
   ```

3. **Token Encryption (AES-256-GCM):**
   ```java
   client.setGoogleAccessToken(encryptionUtil.encrypt(rawAccessToken));
   client.setGoogleRefreshToken(encryptionUtil.encrypt(rawRefreshToken));
   clientRepository.save(client);
   ```

**Two-Tier OAuth:**
- **Admin OAuth:** ROLE_USER users connect on behalf of clients
- **Client OAuth:** ROLE_CLIENT users connect their own accounts

#### 4.1.3 BCrypt Password Encoding
**File:** `src/main/java/com/yrhp/crud/config/SecurityConfig.java` (lines 40-43)

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

**Properties:**
- Algorithm: BCrypt
- Strength: 10 (default iterations/rounds)
- Salt: Automatically generated per password
- Adaptive: Rounds increase with computational power

**Usage:**
```java
// Encoding password during registration
client.setPassword(passwordEncoder.encode(rawPassword));

// Comparison during login (done by Spring Security internally)
// BCryptPasswordEncoder.matches(rawPassword, encodedPassword)
```

---

### 4.2 Authorization & Access Control

#### 4.2.1 Role-Based Access Control (RBAC)
**File:** `src/main/java/com/yrhp/crud/config/SecurityConfig.java` (lines 62-79)

```java
.authorizeHttpRequests(auth -> {
    auth
        // Public resources
        .requestMatchers("/", "/createUser", "/signin",
                "/css/**", "/js/**", "/images/**", "/error/**",
                "/uploads/**", "/Uploads/**").permitAll()
        // Public pages
        .requestMatchers("/user/view/**", "/user/regenerate/**").permitAll()
        // Google OAuth callbacks
        .requestMatchers("/user/google/callback").permitAll()
        .requestMatchers("/client/google/callback").permitAll()
        // Role-based access
        .requestMatchers("/register").denyAll()
        .requestMatchers("/user/**").hasRole("USER")
        .requestMatchers("/client/**").hasRole("CLIENT")
        .anyRequest().authenticated();
})
```

**Role Hierarchy:**
- `ROLE_USER` - Admin/employee users (can manage clients)
- `ROLE_CLIENT` - Business client users (manage own account)
- Public access - Unauthenticated users (login, register only)

#### 4.2.2 Method-Level Authorization
**Files:**
1. `src/main/java/com/yrhp/crud/controller/ClientController.java`
2. `src/main/java/com/yrhp/crud/controller/UserController.java`
3. `src/main/java/com/yrhp/crud/google/GoogleOAuthController.java`

**Implementation:**
```java
@PreAuthorize("hasRole('CLIENT')")
public String home(Model model, Authentication authentication) { }

@PreAuthorize("hasRole('USER')")
public String adminHome(Model model) { }
```

**Benefits:**
- Fine-grained access control at method level
- Throws AccessDeniedException if unauthorized
- Can combine multiple conditions: `hasRole('USER') or hasRole('CLIENT')`

#### 4.2.3 User Identification
**File:** `src/main/java/com/yrhp/crud/google/GoogleOAuthController.java` (lines 160-165)

```java
private Client getAuthenticatedClient() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    String email = auth.getName();  // Spring Security stores email as username
    return clientRepository.findByEmail(email)
        .orElseThrow(() -> new IllegalStateException("Authenticated client not found"));
}
```

---

### 4.3 Spring Security Configuration

#### 4.3.1 SecurityFilterChain
**File:** `src/main/java/com/yrhp/crud/config/SecurityConfig.java` (lines 56-149)

**Filters Applied:**
1. Authentication filter - Processes login form
2. Authorization filter - Checks endpoint access rules
3. Exception translation filter - Converts exceptions
4. Security headers filter - Adds HTTP security headers
5. CSRF filter - (disabled but noted)
6. RemoteIpValve - Handles proxy headers (production)

#### 4.3.2 Exception Handling in Security
```java
.exceptionHandling(exception -> {
    exception
        .accessDeniedPage("/error/403")
        .authenticationEntryPoint((request, response, authException) -> {
            logger.error("Unauthorized access attempt: {}", authException.getMessage());
            response.sendRedirect("/signin?error=unauthorized");
        });
})
```

#### 4.3.3 HTTP Security Headers
```java
.headers(headers -> {
    headers
        .frameOptions(frameOptions -> frameOptions.deny())
        .contentTypeOptions(Customizer.withDefaults());

    // HSTS only in production
    if (isProduction) {
        headers.httpStrictTransportSecurity(hstsConfig -> hstsConfig
            .maxAgeInSeconds(31536000)
            .includeSubDomains(true));
    }
})
```

**Headers Applied:**
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` - Forces HTTPS (prod)

---

### 4.4 CSRF Protection Status

#### 4.4.1 CSRF Disabled (with reasoning)
```java
.csrf(csrf -> {
    logger.debug("Disabling CSRF protection");
    csrf.disable();
    logger.warn("CSRF protection is disabled");
})
```

**Rationale:**
- OAuth2 uses state parameter for CSRF protection
- Session-based authentication prevents CSRF to extent
- Form-to-form attacks limited by OAuth design

#### 4.4.2 Mitigation via OAuth State Parameter
**File:** `src/main/java/com/yrhp/crud/google/GoogleOAuthService.java` (lines 58-85)

```java
// State parameter prevents CSRF in OAuth flow
String state = String.valueOf(clientDbId);  // Admin flow
String state = "client_" + clientDbId;      // Client flow

// Validated on callback
int clientId = Integer.parseInt(state);  // Must parse correctly
```

---

### 4.5 Input Validation & SQL Injection Prevention

#### 4.5.1 Form Validation
**Files:**
1. `src/main/java/com/yrhp/crud/model/Client.java` - Validation constraints
2. `src/main/java/com/yrhp/crud/controller/HomeController.java` - Binding validation

**Example:**
```java
@PostMapping("/createUser")
public String createUser(@Valid @ModelAttribute("user") UserDtls user,
                         BindingResult result,
                         Model model,
                         HttpSession session) {
    if (result.hasErrors()) {
        return "register";  // Return to form with errors
    }
    // Process valid user
}
```

#### 4.5.2 SQL Injection Prevention via JPA
**File:** `src/main/java/com/yrhp/crud/repository/ClientRepository.java`

```java
public interface ClientRepository extends JpaRepository<Client, Integer> {
    // Spring Data JPA generates parameterized queries automatically
    Optional<Client> findByEmail(String email);
    // Equivalent to: SELECT * FROM clients WHERE email = ? (parameter)

    Page<Client> findByNameContainingIgnoreCaseOrMobileContainingOrEmailContainingIgnoreCase(
        String name, String mobile, String email, Pageable pageable);
    // Uses parameterized queries with LIKE operators
}
```

**How It Works:**
1. Method name analyzed by Spring Data JPA
2. Parameterized SQL query generated
3. User input bound as parameter, not concatenated
4. Database driver handles proper escaping
5. SQL injection impossible

#### 4.5.3 JdbcTemplate (if used)
**File:** `src/main/java/com/yrhp/crud/migration/DatabaseSynchronizationMigration.java` (commented)

```java
// Example of parameterized query if used
jdbcTemplate.queryForList(
    "SELECT * FROM clients WHERE email = ?",
    email  // Bound as parameter, not concatenated
);
```

---

### 4.6 Session Management

#### 4.6.1 Session Configuration
**File:** `src/main/java/com/yrhp/crud/config/SecurityConfig.java` (lines 107-115)

```java
.logout(logout -> {
    logout.logoutUrl("/logout")
        .logoutSuccessUrl("/signin?logout")
        .invalidateHttpSession(true)      // Destroy session
        .clearAuthentication(true)         // Clear authentication
        .deleteCookies("JSESSIONID")       // Delete session cookie
        .permitAll();
})
```

**Session Features:**
- Tomcat manages sessions in-memory
- JSESSIONID cookie tracks session
- Automatic session invalidation on logout
- Session timeout configurable (usually 30 min)

---

### 4.7 Secure Password Handling

#### 4.7.1 Password Encoding During Registration
**File:** `src/main/java/com/yrhp/crud/service/ClientService.java` (lines 62-65)

```java
// Encode password before saving
if (client.getPassword() != null && !client.getPassword().isEmpty()) {
    client.setPassword(passwordEncoder.encode(client.getPassword()));
}
clientRepository.save(client);
```

#### 4.7.2 Password Validation Rules
**File:** `src/main/java/com/yrhp/crud/model/Client.java` (lines 23-25)

```java
@NotBlank(message = "Password is required")
@Size(min = 6, message = "Password must be at least 6 characters")
private String password;
```

**Constraints:**
- Minimum 6 characters
- Required (not blank)
- Encoded before storage (never plain text)
- No complexity requirements enforced (potential improvement)

---

### 4.8 API & Endpoint Security

#### 4.8.1 OAuth Callback Endpoints
**File:** `src/main/java/com/yrhp/crud/google/GoogleOAuthController.java`

```java
@GetMapping("/user/google/callback")
public String adminHandleCallback(@RequestParam String code,
                                  @RequestParam String state,
                                  RedirectAttributes ra) {
    // Permissive route (permitAll in SecurityConfig)
    // Security via state parameter validation and user context
    try {
        int clientId = Integer.parseInt(state);  // Validate state format
        oAuthService.exchangeCodeAndFetchBusinessData(code, clientId, false);
        // Success
    } catch (Exception e) {
        // Error handling with logging
    }
}
```

#### 4.8.2 Protected Endpoints
**Files:** ClientController.java, UserController.java

```java
@GetMapping("/client/home")
@PreAuthorize("hasRole('CLIENT')")
public String home(Model model, Authentication authentication) { }

@PostMapping("/user/google/toggle/{clientId}")
public String adminToggleAutoReply(@PathVariable int clientId,
                                   @RequestParam boolean enabled,
                                   RedirectAttributes ra) { }
```

---

### 4.9 Token Encryption (AES-256-GCM)

#### 4.9.1 Token Encryption Utility
**File:** `src/main/java/com/yrhp/crud/google/TokenEncryptionUtil.java`

```java
@Component
public class TokenEncryptionUtil {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128;

    @Value("${TOKEN_ENCRYPTION_KEY}")
    private String base64Key;

    public String encrypt(String plaintext) {
        byte[] iv = new byte[GCM_IV_LENGTH];
        new SecureRandom().nextBytes(iv);  // Unique IV per encryption

        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, getKey(),
            new GCMParameterSpec(GCM_TAG_LENGTH, iv));

        byte[] encrypted = cipher.doFinal(plaintext.getBytes("UTF-8"));

        // Prepend IV to allow decryption
        byte[] combined = new byte[iv.length + encrypted.length];
        System.arraycopy(iv, 0, combined, 0, iv.length);
        System.arraycopy(encrypted, 0, combined, iv.length, encrypted.length);

        return Base64.getEncoder().encodeToString(combined);
    }

    public String decrypt(String encryptedBase64) {
        byte[] combined = Base64.getDecoder().decode(encryptedBase64);

        byte[] iv = new byte[GCM_IV_LENGTH];
        System.arraycopy(combined, 0, iv, 0, iv.length);

        byte[] ciphertext = new byte[combined.length - GCM_IV_LENGTH];
        System.arraycopy(combined, GCM_IV_LENGTH, ciphertext, 0, ciphertext.length);

        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.DECRYPT_MODE, getKey(),
            new GCMParameterSpec(GCM_TAG_LENGTH, iv));

        return new String(cipher.doFinal(ciphertext), "UTF-8");
    }
}
```

**Security Features:**
- **AES-256-GCM**: Authenticated encryption (confidentiality + authentication)
- **Unique IV**: SecureRandom generates new IV for each encryption
- **No key material in code**: Key loaded from environment variable
- **Base64 encoding**: Safe database storage
- **Authentication tag**: Validates data integrity during decryption

#### 4.9.2 Token Usage
**File:** `src/main/java/com/yrhp/crud/google/GoogleOAuthService.java` (lines 145-155)

```java
// Save tokens encrypted
client.setGoogleAccessToken(encryptionUtil.encrypt(rawAccessToken));
client.setGoogleRefreshToken(encryptionUtil.encrypt(rawRefreshToken));
clientRepository.save(client);

// Retrieve and decrypt when needed
String rawAccessToken = encryptionUtil.decrypt(client.getGoogleAccessToken());
String rawRefreshToken = encryptionUtil.decrypt(client.getGoogleRefreshToken());
```

---

## 5. BACKEND ARCHITECTURE TOPICS

### 5.1 Layered Architecture (MVC)

#### 5.1.1 Controller Layer
**Purpose:** Handle HTTP requests and responses

**Files:**
1. `src/main/java/com/yrhp/crud/controller/HomeController.java`
   - Routes: `/signin`, `/register`, `/createUser`, `/`
   - Responsibilities: Form display, form processing, redirect logic

2. `src/main/java/com/yrhp/crud/controller/ClientController.java`
   - Routes: `/client/**`
   - Responsibilities: Client dashboard, profile management

3. `src/main/java/com/yrhp/crud/controller/UserController.java`
   - Routes: `/user/**`
   - Responsibilities: Admin functions, client management

4. `src/main/java/com/yrhp/crud/controller/ChatTextController.java`
   - Routes: `/chattext/**`
   - Responsibilities: Review generation endpoints

5. `src/main/java/com/yrhp/crud/google/GoogleOAuthController.java`
   - Routes: `/user/google/`, `/client/google/`
   - Responsibilities: OAuth callback handling

**Controller Responsibilities:**
- Accept HTTP requests
- Validate input (via @Valid)
- Delegate to service layer
- Build response (Model + View or Redirect)
- Handle exceptions (thrown to GlobalExceptionHandler)

#### 5.1.2 Service Layer
**Purpose:** Implement business logic and orchestration

**Files:**
1. `src/main/java/com/yrhp/crud/service/ClientService.java`
   - Methods: `saveClient()`, `getClientByEmail()`, `updateClient()`
   - Responsibilities: Client CRUD, file upload handling, password encoding

2. `src/main/java/com/yrhp/crud/service/UserService.java` / `UserServiceImpl.java`
   - Methods: `createUser()`, `checkEmail()`, `updateUser()`
   - Responsibilities: User management, authentication

3. `src/main/java/com/yrhp/crud/service/ChatGPTService.java`
   - Methods: `getResponse()`
   - Responsibilities: OpenAI API integration, response handling

4. `src/main/java/com/yrhp/crud/service/UserDetailsServiceImpl.java`
   - Implements: Spring Security's UserDetailsService
   - Methods: `loadUserByUsername()`
   - Responsibilities: Load user/client details for authentication

5. `src/main/java/com/yrhp/crud/service/ReviewGeneratorService.java`
   - Methods: `generateReview()`, `logGeneration()`
   - Responsibilities: Review generation logic, logging

6. `src/main/java/com/yrhp/crud/service/ReviewGenerationLogService.java`
   - Methods: `getLogsByCompanyName()`, `getLogsByTimestampRange()`
   - Responsibilities: Log retrieval and filtering

7. `src/main/java/com/yrhp/crud/google/GoogleOAuthService.java`
   - Methods: `buildAuthorizationUrl()`, `exchangeCodeAndFetchBusinessData()`, `getValidAccessToken()`
   - Responsibilities: OAuth token management, API integration

8. `src/main/java/com/yrhp/crud/google/GoogleAutoReplyService.java`
   - Methods: `processAllClients()`, `processClient()`
   - Responsibilities: Auto-reply orchestration

9. `src/main/java/com/yrhp/crud/google/GoogleReviewFetcherService.java`
   - Methods: `fetchReviews()`
   - Responsibilities: Fetch reviews from Google API

10. `src/main/java/com/yrhp/crud/google/GoogleReviewReplierService.java`
    - Methods: `replyToReview()`
    - Responsibilities: Send replies to Google API

11. `src/main/java/com/yrhp/crud/google/GoogleReplyGeneratorService.java`
    - Methods: `generateReply()`
    - Responsibilities: Generate reply text using ChatGPT

**Service Layer Responsibilities:**
- Implement business rules
- Coordinate multiple repositories
- Manage transactions
- Handle data transformation
- Call external APIs
- Log important operations

#### 5.1.3 Repository Layer
**Purpose:** Abstract data access from business logic

**Files:**
1. `src/main/java/com/yrhp/crud/repository/ClientRepository.java`
   - Extends: `JpaRepository<Client, Integer>`
   - Query methods: `findByEmail()`, `findByMobile()`, `findByName()`, `findByAutoReplyEnabledTrue()`
   - Custom finder methods

2. `src/main/java/com/yrhp/crud/repository/UserRepository.java`
   - Extends: `JpaRepository<UserDtls, Integer>`
   - Query methods: `findByEmail()`, `existsByEmail()`

3. `src/main/java/com/yrhp/crud/repository/ReviewGenerationLogRepository.java`
   - Extends: `JpaRepository<ReviewGenerationLog, Integer>`
   - Query methods: `findByCompanyName()`, `findByTimestampBetween()`
   - Supports pagination

4. `src/main/java/com/yrhp/crud/repository/GoogleReplyLogRepository.java`
   - Extends: `JpaRepository<GoogleReplyLog, Long>`
   - Query methods: `findByClientIdOrderByRepliedAtDesc()`

**Repository Responsibilities:**
- Define data access contracts
- Derive queries from method names (Spring Data JPA)
- Support pagination and sorting
- No business logic - only CRUD and querying

#### 5.1.4 Model/Entity Layer
**Purpose:** Represent domain objects with ORM mapping

**Files:**
1. `src/main/java/com/yrhp/crud/model/Client.java`
   - Entity: clients table
   - Fields: id, name, email, password, mobile, reviewLink, chatText, role, googleAccountId, googleAccessToken, etc.
   - Validations: @NotBlank, @Email, @Pattern, @Size

2. `src/main/java/com/yrhp/crud/model/UserDtls.java`
   - Entity: user_details / users table
   - Fields: id, name, email, password, mobile, role
   - Validations: similar to Client

3. `src/main/java/com/yrhp/crud/model/ReviewGenerationLog.java`
   - Entity: review_generation_logs table
   - Fields: id, clientId, reviewLink, reviewText, generatedReview, status, timestamp

4. `src/main/java/com/yrhp/crud/model/GoogleReplyLog.java`
   - Entity: google_reply_logs table
   - Fields: id, clientId, reviewId, reviewerName, reviewRating, reviewText, replyText, repliedAt, status, errorMessage

**Model Responsibilities:**
- Map to database tables
- Define constraints and validations
- Provide getters/setters
- Support ORM hibernation

---

### 5.2 Dependency Injection

#### 5.2.1 Constructor-Based Injection (Recommended)
**File:** `src/main/java/com/yrhp/crud/google/GoogleReviewScheduler.java`

```java
@Component
public class GoogleReviewScheduler {

    private final GoogleAutoReplyService autoReplyService;

    public GoogleReviewScheduler(GoogleAutoReplyService autoReplyService) {
        this.autoReplyService = autoReplyService;  // Constructor injection
    }
}
```

#### 5.2.2 Field-Based Injection (Autowired)
**File:** `src/main/java/com/yrhp/crud/controller/HomeController.java`

```java
@Controller
public class HomeController {

    @Autowired
    private UserService userService;
}
```

#### 5.2.3 Setter-Based Injection
**File:** `src/main/java/com/yrhp/crud/config/SecurityConfig.java`

```java
@Autowired
private UserDetailsService userDetailsService;

@Autowired
private Environment environment;
```

#### 5.2.4 Value Injection
**File:** `src/main/java/com/yrhp/crud/service/ChatGPTService.java`

```java
@Value("${OPEN_AI_URL}")
private String OPEN_AI_URL;

@Value("${OPEN_AI_KEY}")
private String OPEN_AI_KEY;
```

**Benefits of Dependency Injection:**
- Loose coupling
- Easy testing (mock dependencies)
- Centralized bean management (Spring)
- Automatic lifecycle management

---

### 5.3 Bean Management

#### 5.3.1 Component Annotations
**@Component** - Generic spring-managed component
- `src/main/java/com/yrhp/crud/google/GoogleAutoReplyService.java`
- `src/main/java/com/yrhp/crud/google/GoogleReviewScheduler.java`
- `src/main/java/com/yrhp/crud/google/TokenEncryptionUtil.java`

**@Service** - Service layer component (special @Component)
- All service classes use @Service annotation
- Indicates transactional and business logic layer

**@Repository** - Repository layer component
- All repository interfaces use @Repository annotation
- Provides special exception translation

**@Controller** - Web controller component
- All controller classes use @Controller annotation
- Indicates request handling

#### 5.3.2 Bean Creation (@Bean)
**File:** `src/main/java/com/yrhp/crud/config/SecurityConfig.java`

```java
@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider getDaoAuthProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http.build();
    }
}
```

**File:** `src/main/java/com/yrhp/crud/config/RestTemplateConfig.java`

```java
@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder.build();
    }
}
```

---

### 5.4 Configuration Classes

#### 5.4.1 @Configuration Classes
**Files:**
1. `SecurityConfig.java` - Spring Security configuration
2. `RestTemplateConfig.java` - RestTemplate bean configuration
3. `JacksonConfig.java` - JSON object mapper configuration (if any)
4. `HttpsRedirectConfig.java` - HTTPS redirect configuration

**Structure:**
```java
@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() { ... }

    @Bean
    public DaoAuthenticationProvider getDaoAuthProvider() { ... }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) { ... }
}
```

#### 5.4.2 Profile-Specific Configuration
**File:** `src/main/java/com/yrhp/crud/config/HttpsRedirectConfig.java`

```java
@Configuration
@Profile("prod")
public class HttpsRedirectConfig {
    // Only loaded in production profile
}
```

---

### 5.5 DTO Pattern (Data Transfer Objects)

#### 5.5.1 Request DTOs
**File:** `src/main/java/com/yrhp/crud/request/ChatGPTRequest.java`

```java
@Data
public class ChatGPTRequest {

    @NotBlank(message = "Model name cannot be blank")
    private String model = "gpt-4o-mini";

    @NotEmpty(message = "Messages list cannot be empty")
    private List<ChatGPTMessage> messages;

    @Min(value = 0)
    @Max(value = 2)
    private int temperature = 1;

    @SerializedName(value = "max_tokens")
    @Min(value = 1)
    @Max(value = 4096)
    private int maxTokens = 256;
}
```

**File:** `src/main/java/com/yrhp/crud/request/ChatGPTMessage.java`

```java
public class ChatGPTMessage {
    private String role;     // "user", "system", "assistant"
    private String content;
}
```

**File:** `src/main/java/com/yrhp/crud/dto/RegenerateReviewRequest.java`

```java
public class RegenerateReviewRequest {
    private String reviewLink;
    private String originalReview;
    private int generationCount;
}
```

#### 5.5.2 Response DTOs
**File:** `src/main/java/com/yrhp/crud/response/ChatGPTResponse.java`

```java
@Data
public class ChatGPTResponse {
    private List<ChatGPTChoice> choices;
}
```

**File:** `src/main/java/com/yrhp/crud/response/ChatGPTChoice.java`

```java
public class ChatGPTChoice {
    private int index;
    private ChatGPTResponseMessage message;
    private String finishReason;
}
```

**File:** `src/main/java/com/yrhp/crud/response/ChatGPTResponseMessage.java`

```java
public class ChatGPTResponseMessage {
    private String role;
    private String content;
}
```

#### 5.5.3 Error Response DTO
**File:** `src/main/java/com/yrhp/crud/exception/ErrorResponse.java`

```java
public class ErrorResponse {
    private int status;
    private String message;

    public ErrorResponse(int status, String message) {
        this.status = status;
        this.message = message;
    }
}
```

**Benefits of DTO Pattern:**
- Decouple API contracts from entity objects
- Hide sensitive data from responses
- Version API independently
- Validate input early
- Reduce network payload

---

### 5.6 Entity Mapping

#### 5.6.1 Entity-to-Service Mapping
**File:** `src/main/java/com/yrhp/crud/service/ClientService.java` (lines 32-48)

```java
public Client saveClient(ClientDao clientDao) {
    Client client = new Client();
    client.setName(clientDao.getName());
    client.setEmail(clientDao.getEmail());
    client.setMobile(clientDao.getMobile());
    client.setReviewLink(clientDao.getReviewLink());
    client.setChatText(clientDao.getChatText());
    client.setGenerateLink("/user/view/" + client.getName().replaceAll("\\s", "-").toLowerCase());
    return clientRepository.save(client);
}
```

#### 5.6.2 Data Access Object (DAO) Pattern
**File:** `src/main/java/com/yrhp/crud/dao/ClientDao.java`

```java
public class ClientDao {
    private String name;
    private String email;
    private String mobile;
    private String reviewLink;
    private String chatText;
    // Transfer data from controller to service
}
```

---

### 5.7 Transaction Management

#### 5.7.1 @Transactional Annotation
**File:** `src/main/java/com/yrhp/crud/service/ClientService.java` (if used)

```java
@Service
public class ClientService {

    @Transactional
    public Client saveClient(Client client, MultipartFile file) throws IOException {
        // All database operations within this method are part of single transaction
        // If any exception occurs, automatic rollback
        // If method completes successfully, automatic commit
    }
}
```

**Transaction Benefits:**
- ACID compliance
- Automatic rollback on exception
- Automatic commit on success
- Multiple database operations as atomic unit

---

### 5.8 REST API Design

#### 5.8.1 RESTful Endpoints
**Controller Routing Examples:**

1. **GET endpoint for form display:**
   ```java
   @GetMapping("/register")
   public String register(Model model, HttpSession session) { }
   ```

2. **POST endpoint for form submission:**
   ```java
   @PostMapping("/createUser")
   public String createUser(@Valid @ModelAttribute("user") UserDtls user, ...) { }
   ```

3. **GET endpoint for resource retrieval:**
   ```java
   @GetMapping("/client/home")
   public String home(Model model, Authentication authentication) { }
   ```

4. **GET endpoint with path variable:**
   ```java
   @GetMapping("/user/google/settings/{clientId}")
   public String adminGoogleSettings(@PathVariable int clientId, Model model) { }
   ```

5. **POST endpoint with request parameters:**
   ```java
   @PostMapping("/user/google/toggle/{clientId}")
   public String adminToggleAutoReply(@PathVariable int clientId,
                                      @RequestParam boolean enabled, ...) { }
   ```

#### 5.8.2 HTTP Status Codes
**Used in responses:**
- 200 OK - Successful GET/POST
- 302 Found - Redirect (redirect:/path)
- 400 Bad Request - Validation errors
- 401 Unauthorized - Authentication required
- 403 Forbidden - Access denied
- 404 Not Found - Resource not found
- 500 Internal Server Error - Server error

---

### 5.9 Exception Handling Architecture

#### 5.9.1 Global Exception Handler
**File:** `src/main/java/com/yrhp/crud/exception/GlobalExceptionHandler.java`

```java
@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleResourceNotFoundException(ResourceNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        return new ResponseEntity<>(
            new ErrorResponse(HttpStatus.NOT_FOUND.value(), ex.getMessage()),
            HttpStatus.NOT_FOUND
        );
    }

    // ... other exception handlers
}
```

#### 5.9.2 Exception Flow
1. Exception thrown in service/controller
2. Spring catches exception
3. GlobalExceptionHandler matches exception type
4. Appropriate @ExceptionHandler method invoked
5. ErrorResponse returned to client
6. Exception logged

---

## 6. DATABASE TOPICS

### 6.1 JPA Entities

#### 6.1.1 Entity Classes

| Class | Table | Purpose |
|-------|-------|---------|
| `Client` | `clients` | Business client accounts |
| `UserDtls` | `user_details` | Admin/employee users |
| `ReviewGenerationLog` | `review_generation_logs` | Track generated reviews |
| `GoogleReplyLog` | `google_reply_logs` | Track Google auto-replies |

#### 6.1.2 Entity Relationships

**Implicit relationship (via clientId):**
- `ReviewGenerationLog.clientId` → `Client.id`
- `GoogleReplyLog.clientId` → `Client.id`

*(JPA relationships not explicitly mapped with @OneToMany/@ManyToOne)*

---

### 6.2 Hibernate Mapping Configuration

#### 6.2.1 Hibernate Configuration
**File:** `src/main/resources/application.properties` (lines 10-16)

```properties
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://192.168.29.150:3306/review_generator
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.show-sql=false
spring.jpa.hibernate.ddl-auto=update
```

**Configuration Details:**
- **Driver:** MySQL JDBC driver (version 8.x compatible)
- **URL:** Database connection string
- **Dialect:** Hibernate uses MySQL8Dialect for SQL generation
- **DDL Auto:** `update` mode (creates/updates schema on startup)
- **SQL Logging:** Disabled for production

#### 6.2.2 Entity Mapping Annotations
**File:** `src/main/java/com/yrhp/crud/model/Client.java`

```java
@Entity
@Table(name = "clients")
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "google_access_token", columnDefinition = "TEXT")
    private String googleAccessToken;

    @Column(nullable = false)
    private String role = "ROLE_CLIENT";
}
```

**Annotation Meanings:**
- `@Entity` - JPA entity, maps to database table
- `@Table(name="clients")` - Table name in database
- `@Id` - Primary key
- `@GeneratedValue` - Auto-generate ID (IDENTITY = auto-increment)
- `@Column` - Column configuration (name, type, constraints)
- `columnDefinition = "TEXT"` - Use TEXT type for encrypted long values

---

### 6.3 Repository Query Methods

#### 6.3.1 Derived Query Methods
**File:** `src/main/java/com/yrhp/crud/repository/ClientRepository.java`

```java
@Repository
public interface ClientRepository extends JpaRepository<Client, Integer> {

    // Simple queries derived from method names
    List<Client> findByName(String name);
    Optional<Client> findByEmail(String email);
    Optional<Client> findByMobile(String mobile);

    // Existence check
    boolean existsByEmail(String email);
    boolean existsByMobile(String mobile);

    // Complex query with multiple conditions (OR)
    Page<Client> findByNameContainingIgnoreCaseOrMobileContainingOrEmailContainingIgnoreCase(
        String name, String mobile, String email, Pageable pageable);

    // Filter by specific field
    List<Client> findByAutoReplyEnabledTrue();
}
```

**Query Method Conventions:**
- `findBy[Field]` - WHERE field = ?
- `findBy[Field1]Or[Field2]` - WHERE field1 OR field2
- `existsBy[Field]` - EXISTS check
- `Containing` - LIKE %?%
- `IgnoreCase` - CASE INSENSITIVE
- `True` / `False` - Boolean filters

#### 6.3.2 Pagination
**Usage Example:**

```java
// In service
Pageable pageable = PageRequest.of(0, 10, Sort.by("email"));
Page<Client> page = clientRepository.findByNameContainingIgnoreCaseOrMobileContainingOrEmailContainingIgnoreCase(
    searchTerm, searchTerm, searchTerm, pageable);

// Results include: page.getContent(), page.getTotalElements(), page.getTotalPages()
```

---

### 6.4 Custom Queries (if used)

#### 6.4.1 JPQL Queries
**Not extensively used in current codebase, but pattern:**

```java
@Query("SELECT c FROM Client c WHERE c.autoReplyEnabled = true")
List<Client> findAutoReplyClients();

@Query("SELECT c FROM Client c WHERE c.email = :email")
Optional<Client> findByEmailCustom(@Param("email") String email);
```

#### 6.4.2 Native SQL (if used)
**Not used in current codebase, but pattern:**

```java
@Query(value = "SELECT * FROM clients WHERE role = ?1", nativeQuery = true)
List<Client> findByRoleNative(String role);
```

---

### 6.5 Transaction Management in Database

#### 6.5.1 Transaction Boundaries
**Method Level:**
```java
@Service
public class ClientService {

    @Transactional
    public Client saveClient(Client client) {
        // Entire method runs in single transaction
        // Auto-commit on success, auto-rollback on exception
    }
}
```

#### 6.5.2 Default Transaction Settings
- **Propagation:** REQUIRED (reuse existing or create new)
- **Isolation:** Depends on database (usually READ_COMMITTED)
- **Read-Only:** false (allows writes)
- **Timeout:** None by default

---

### 6.6 Database Migrations (Hibernate DDL)

#### 6.6.1 Automatic Schema Management
**Configuration:**
```properties
spring.jpa.hibernate.ddl-auto=update
```

**Modes Available:**
- `validate` - Validate schema, no changes
- `update` - Update schema if needed *(current)*
- `create` - Create schema, drop existing
- `create-drop` - Create on startup, drop on shutdown

#### 6.6.2 Manual Migration (Commented)
**File:** `src/main/java/com/yrhp/crud/migration/DatabaseSynchronizationMigration.java`

```java
@Component
public class DatabaseSynchronizationMigration {

    @PostConstruct
    public void initializeDatabaseSynchronization() {
        // Run on application startup
        migrateExistingClients();
        createInsertTrigger();
        createDeleteTrigger();
        createUpdateTrigger();
    }
}
```

*(Currently commented out, indicates previous migration approach)*

---

## 7. API & INTEGRATION TOPICS

### 7.1 External API Integrations

#### 7.1.1 OpenAI API Integration
**Service:** `src/main/java/com/yrhp/crud/service/ChatGPTService.java`

**Integration Details:**
- **API:** OpenAI ChatGPT API
- **Endpoint:** `https://api.openai.com/v1/chat/completions`
- **Authentication:** Bearer token in Authorization header
- **HTTP Client:** Apache HttpClient 5
- **Protocol:** HTTPS (TLS secured)

**Request Structure:**
```java
ChatGPTRequest request = new ChatGPTRequest();
request.setModel("gpt-4o-mini");  // Latest mini model
request.setMessages(userQuery);
request.setTemperature(1);        // Randomness level
request.setMaxTokens(256);        // Output limit

// Serialize to JSON
String body = gson.toJson(request);
```

**Response Handling:**
```java
ChatGPTResponse response = gson.fromJson(responseBody, ChatGPTResponse.class);
ChatGPTChoice choice = response.getChoices().get(0);
String generatedText = choice.getMessage().getContent();
```

**Error Handling:**
- HTTP 401: Invalid API key
- HTTP 429: Rate limit exceeded
- HTTP 5xx: Service unavailable

---

#### 7.1.2 Google Business APIs Integration
**Service:** `src/main/java/com/yrhp/crud/google/GoogleOAuthService.java`

**APIs Used:**
1. **Google OAuth 2.0**
   - Endpoint: `https://accounts.google.com/o/oauth2/v2/auth`
   - Token Exchange: `https://oauth2.googleapis.com/token`
   - Scope: `https://www.googleapis.com/auth/business.manage`

2. **Google Business Account Management API**
   - Endpoint: `https://mybusinessaccountmanagement.googleapis.com/v1/accounts`
   - Purpose: List business accounts under authenticated user

3. **Google Business Information API**
   - Endpoint: `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/{id}/locations`
   - Purpose: Get location details and reviews

**OAuth2 Flow:**
```
1. Generate authorization URL with state parameter
2. User authenticates with Google
3. Google redirects to callback with auth code
4. Exchange code for access/refresh tokens
5. Use access token to call Business APIs
6. Store tokens encrypted
7. Use refresh token to get new access tokens when expired
```

---

### 7.2 OAuth2 Integration Details

#### 7.2.1 Authorization Code Flow
**File:** `src/main/java/com/yrhp/crud/google/GoogleOAuthService.java`

```java
// Step 1: Build authorization URL
public String buildAuthorizationUrl(int clientDbId) {
    return "https://accounts.google.com/o/oauth2/v2/auth" +
        "?client_id=" + clientId +
        "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8) +
        "&response_type=code" +
        "&scope=" + URLEncoder.encode("https://www.googleapis.com/auth/business.manage", ...) +
        "&access_type=offline" +
        "&prompt=consent" +
        "&state=" + state;  // Mitigates CSRF
}

// Step 2: Handle callback with authorization code
@GetMapping("/user/google/callback")
public String adminHandleCallback(@RequestParam String code,
                                  @RequestParam String state,
                                  RedirectAttributes ra) {
    // Exchange code for tokens
    oAuthService.exchangeCodeAndFetchBusinessData(code, clientId, false);
}

// Step 3: Exchange code for tokens
private void exchangeCodeForTokens(String code, String clientDbId) {
    String body = "code=" + code +
                  "&client_id=" + clientId +
                  "&client_secret=" + clientSecret +
                  "&redirect_uri=" + redirectUri +
                  "&grant_type=authorization_code";

    // POST request to token endpoint
    // Receive: access_token, refresh_token, expires_in
}
```

#### 7.2.2 Token Management
**Token Lifecycle:**

```
Access Token:  Expires in ~1 hour
Refresh Token: Long-lived (can refresh many times)
Token Expiry:  Stored as timestamp (System.currentTimeMillis() + expiresIn)
```

**Token Refresh:**
```java
public String getValidAccessToken(Client client) throws Exception {
    long bufferMs = 5 * 60 * 1000;  // 5 minute buffer

    if (client.getGoogleTokenExpiry() == null ||
        System.currentTimeMillis() > client.getGoogleTokenExpiry() - bufferMs) {
        return refreshAccessToken(client);  // Get new token
    }

    return encryptionUtil.decrypt(client.getGoogleAccessToken());  // Use existing
}
```

---

### 7.3 JSON Processing

#### 7.3.1 Gson Library
**Dependency:** Google's Gson (pom.xml line 93-95)

**Usage Patterns:**

1. **Object to JSON:**
   ```java
   ChatGPTRequest request = new ChatGPTRequest();
   request.setModel("gpt-4o-mini");
   request.setMessages(messages);

   Gson gson = new Gson();
   String json = gson.toJson(request);
   ```

2. **JSON to Object:**
   ```java
   String responseBody = "{ \"choices\": [...] }";
   ChatGPTResponse response = gson.fromJson(responseBody, ChatGPTResponse.class);
   ```

3. **JSON with Field Mapping:**
   ```java
   @SerializedName(value = "max_tokens")
   private int maxTokens;

   // Gson automatically maps JSON "max_tokens" to maxTokens field
   ```

#### 7.3.2 Jackson Configuration (if used)
**File:** `src/main/java/com/yrhp/crud/config/JacksonConfig.java`

**Configuration:**
```properties
spring.jackson.serialization.write-dates-as-timestamps=false
spring.jackson.date-format=yyyy-MM-dd'T'HH:mm:ss
```

---

### 7.4 REST Template (if used)

#### 7.4.1 RestTemplate Bean
**File:** `src/main/java/com/yrhp/crud/config/RestTemplateConfig.java`

```java
@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder.build();
    }
}
```

**Usage Pattern (if used in code):**
```java
@Autowired
private RestTemplate restTemplate;

ResponseEntity<String> response = restTemplate.exchange(
    url,
    HttpMethod.POST,
    new HttpEntity<>(body, headers),
    String.class
);
```

*(Primary code uses Apache HttpClient instead)*

---

## 8. CONFIGURATION AND INFRASTRUCTURE TOPICS

### 8.1 Spring Boot Properties

#### 8.1.1 application.properties
**File:** `src/main/resources/application.properties`

**Categories:**

1. **Application Info**
   ```properties
   spring.application.name=YRHP_REVIEW_GENERATOR
   spring.profiles.active=dev
   ```

2. **Database Configuration**
   ```properties
   spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
   spring.datasource.url=jdbc:mysql://192.168.29.150:3306/review_generator
   spring.datasource.username=review-card
   spring.datasource.password=Str0ng!885599
   ```

3. **JPA Configuration**
   ```properties
   spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
   spring.jpa.show-sql=false
   spring.jpa.hibernate.ddl-auto=update
   ```

4. **File Upload Configuration**
   ```properties
   spring.servlet.multipart.enabled=true
   spring.servlet.multipart.max-file-size=2MB
   spring.servlet.multipart.max-request-size=2MB
   ```

5. **Thymeleaf Configuration**
   ```properties
   spring.thymeleaf.prefix=classpath:/templates/
   spring.thymeleaf.suffix=.html
   ```

6. **External API Configuration**
   ```properties
   OPEN_AI_URL=https://api.openai.com/v1/chat/completions
   OPEN_AI_KEY=sk-proj-...
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   TOKEN_ENCRYPTION_KEY=...
   ```

---

#### 8.1.2 Profile-Specific Properties
**Files:**
1. `src/main/resources/application-dev.properties` - Development configuration
2. `src/main/resources/application-prod.properties` - Production configuration

**Activation:**
```properties
spring.profiles.active=dev  # In application.properties
```

**Usage in Code:**
```java
@Profile("prod")
public class HttpsRedirectConfig { ... }
```

---

### 8.2 Environment Variables

#### 8.2.1 Externalized Configuration
**Reason:** Sensitive data shouldn't be in source code

**Environment Variables Used:**
```properties
OPEN_AI_KEY=              # OpenAI API key
GOOGLE_CLIENT_ID=         # Google OAuth client ID
GOOGLE_CLIENT_SECRET=     # Google OAuth secret
GOOGLE_REDIRECT_URI=      # OAuth callback URL
GOOGLE_CLIENT_REDIRECT_URI=  # Client OAuth callback
TOKEN_ENCRYPTION_KEY=     # AES-256 encryption key (base64)
```

**Accessed in Code:**
```java
@Value("${OPEN_AI_KEY}")
private String OPEN_AI_KEY;

@Value("${TOKEN_ENCRYPTION_KEY}")
private String base64Key;
```

---

### 8.3 Logging Configuration

#### 8.3.1 SLF4J Logging Levels
**File:** `src/main/resources/application.properties` (lines 43-50)

```properties
logging.level.org.springframework.security=INFO
logging.level.com.yrhp.crud.service=INFO
logging.level.org.hibernate.SQL=ERROR
logging.level.org.springframework.web=INFO
logging.level.com.yrhp.crud.service.ClientService=DEBUG
logging.level.org.springframework.transaction=DEBUG
```

**Log Levels (increasing severity):**
- TRACE - Most verbose
- DEBUG - Development debugging
- INFO - Informational messages
- WARN - Warning conditions
- ERROR - Error conditions
- OFF - No logging

#### 8.3.2 Logging Usage in Code
**Every service and controller logs:**
```java
private static final Logger log = LoggerFactory.getLogger(ClassName.class);

log.info("User logged in with role: {}", role);
log.error("Error saving client: {}", e.getMessage(), e);
log.warn("Validation errors in user creation: {}", errors);
```

---

### 8.4 Server Configuration

#### 8.4.1 Embedded Tomcat
**Port:** 8080 (default)

**Configuration:**
```java
// Implicit in spring-boot-starter-web
// Can be overridden in application.properties:
// server.port=8080
```

#### 8.4.2 HTTP/HTTPS Header Forwarding
**File:** `src/main/resources/application.properties` (line 73)

```properties
server.forward-headers-strategy=framework
```

**Purpose:** Respect X-Forwarded-* headers from proxy/load balancer

---

### 8.5 Security Infrastructure Configuration

#### 8.5.1 HTTPS Redirect Configuration
**File:** `src/main/java/com/yrhp/crud/config/HttpsRedirectConfig.java`

```java
@Configuration
@Profile("prod")
public class HttpsRedirectConfig {

    @Bean
    public ServletWebServerFactory servletContainer() {
        TomcatServletWebServerFactory tomcat = new TomcatServletWebServerFactory();

        RemoteIpValve remoteIpValve = new RemoteIpValve();
        remoteIpValve.setRemoteIpHeader("X-Forwarded-For");
        remoteIpValve.setProxiesHeader("X-Forwarded-By");
        remoteIpValve.setProtocolHeader("X-Forwarded-Proto");
        remoteIpValve.setProtocolHeaderHttpsValue("https");

        tomcat.addEngineValves(remoteIpValve);
        return tomcat;
    }
}
```

**Purpose:**
- Trust proxy headers (X-Forwarded-Proto, X-Forwarded-For)
- Tomcat sees requests as HTTPS even if proxy is HTTP
- Needed for proper HSTS enforcement

#### 8.5.2 Security Headers Configuration
**File:** `src/main/java/com/yrhp/crud/config/SecurityConfig.java` (lines 127-140)

```java
.headers(headers -> {
    headers
        .frameOptions(frameOptions -> frameOptions.deny())
        .contentTypeOptions(Customizer.withDefaults());

    if (isProduction) {
        headers.httpStrictTransportSecurity(hstsConfig -> hstsConfig
            .maxAgeInSeconds(31536000)  // 1 year
            .includeSubDomains(true));
    }
})
```

**Headers Applied:**
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security: max-age=31536000; includeSubDomains (prod only)

---

## 9. DESIGN PATTERNS DETECTED

### 9.1 MVC Pattern (Model-View-Controller)

**File:** `src/main/java/com/yrhp/crud/controller/HomeController.java`

**Components:**
1. **Model** - `UserDtls` entity, data passed to view
2. **View** - Thymeleaf templates (register.html, login.html)
3. **Controller** - HomeController handles requests, populates model, returns view name

**Example:**
```java
@GetMapping("/register")
public String register(Model model, HttpSession session) {
    model.addAttribute("user", new UserDtls());  // Model
    // ... populate more attributes
    return "register";  // View name
}
```

**Flow:**
1. Request to /register
2. Controller creates UserDtls object
3. Adds to Model
4. Returns view name "register"
5. Spring renders templates/register.html with model data

---

### 9.2 Repository Pattern

**File:** `src/main/java/com/yrhp/crud/repository/ClientRepository.java`

**Purpose:** Abstract data access details from business logic

```java
@Repository
public interface ClientRepository extends JpaRepository<Client, Integer> {
    Optional<Client> findByEmail(String email);
    Optional<Client> findByMobile(String mobile);
}
```

**Benefits:**
- Service doesn't know about database implementation
- Easy to mock for testing
- Can swap implementations without changing service code
- Centralized data access logic

---

### 9.3 Service Layer Pattern

**Files:** All classes in `src/main/java/com/yrhp/crud/service/`

**Purpose:** Encapsulate business logic, separate concerns

**Components:**
- Service interfaces (contracts)
- Service implementations (@Service)
- Business logic and validation
- Orchestration of repositories
- Transaction management

**Example:**
```java
@Service
public class ClientService {

    @Autowired
    private ClientRepository clientRepository;

    public Client saveClient(Client client, MultipartFile file) throws IOException {
        // Business logic
        // File handling
        // Password encoding
        // Repository delegation
        return clientRepository.save(client);
    }
}
```

---

### 9.4 DTO (Data Transfer Object) Pattern

**Files:** `src/main/java/com/yrhp/crud/request/`, `src/main/java/com/yrhp/crud/response/`

**Purpose:**
- Decouple external contracts from internal entities
- Hide sensitive fields
- Version APIs independently
- Validate input early

**Example:**
```java
// API contract (DTO)
@Data
public class ChatGPTRequest {
    @SerializedName("max_tokens")
    private int maxTokens;
}

// Internal entity (separate from DTO)
@Entity
public class ReviewLog {
    private String generatedReview;
}
```

---

### 9.5 Builder Pattern

**Manual builder pattern in ClientService:**

```java
public Client saveClient(ClientDao clientDao) {
    Client client = new Client();  // Begin building
    client.setName(clientDao.getName());
    client.setEmail(clientDao.getEmail());
    client.setMobile(clientDao.getMobile());
    client.setReviewLink(clientDao.getReviewLink());
    client.setChatText(clientDao.getChatText());
    // ... more setters
    return clientRepository.save(client);  // Complete
}
```

*(If Lombok builder used, would be @Builder annotation)*

---

### 9.6 Factory Pattern

**Spring @Bean Factory Methods:**

```java
@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();  // Factory creates instance
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) {
        // ... configure and return
        return http.build();  // Factory method
    }
}
```

---

### 9.7 Singleton Pattern

**Spring Beans are Singletons by default:**

```java
@Service
public class ClientService {
    // Single instance created by Spring
    // Reused across application
}

@Component
public class TokenEncryptionUtil {
    // Singleton component
}
```

---

### 9.8 Adapter Pattern

**CustomUserDetails adapts UserDtls to UserDetails interface:**

```java
public class CustomUserDetails implements UserDetails {

    private UserDtls user;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Arrays.asList(new SimpleGrantedAuthority(user.getRole()));
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }
}
```

---

### 9.9 Decorator Pattern

**Spring Security adds decorators to requests:**

```
Original Request
    ↓
Authentication Filter (decorator)
    ↓
Authorization Filter (decorator)
    ↓
Security Headers Filter (decorator)
    ↓
Actual Controller
```

---

### 9.10 Template Method Pattern

**Spring Security authentication flow (template):**

```java
// Template in DaoAuthenticationProvider
// Specific implementation in UserDetailsServiceImpl

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Override
    public UserDetails loadUserByUsername(String email) {
        // Specific implementation of template method
    }
}
```

---

## 10. FILE-BASED EVIDENCE

### 10.1 Core Architecture Files

| File | Purpose | Key Content |
|------|---------|-------------|
| `Application.java` | Entry point | @SpringBootApplication, @EnableScheduling |
| `SecurityConfig.java` | Security configuration | SecurityFilterChain, PasswordEncoder, Authentication |
| `RestTemplateConfig.java` | REST client beans | RestTemplate factory |
| `HttpsRedirectConfig.java` | HTTPS configuration | RemoteIpValve, deployed in prod profile |

### 10.2 Controller Files

| File | Routes | Pattern |
|------|--------|---------|
| `HomeController.java` | `/`, `/signin`, `/register`, `/createUser` | @GetMapping, @PostMapping, form handling |
| `ClientController.java` | `/client/**` | @PreAuthorize("hasRole('CLIENT')") |
| `UserController.java` | `/user/**` | @PreAuthorize("hasRole('USER')") |
| `ChatTextController.java` | `/chattext/**` | Review generation endpoints |
| `GoogleOAuthController.java` | `/user/google/`, `/client/google/` | OAuth callbacks |

### 10.3 Service Files

| File | Responsibilities | Pattern |
|------|-----------------|---------|
| `ClientService.java` | Client CRUD, file upload, password encoding | @Service, @Transactional |
| `UserService.java` / `UserServiceImpl.java` | User management | @Service, dependency injection |
| `ChatGPTService.java` | OpenAI API integration | Apache HttpClient, Gson, exception handling |
| `UserDetailsServiceImpl.java` | Spring Security integration | implements UserDetailsService |
| `ReviewGeneratorService.java` | Core business logic | Streams, collections, logging |
| `GoogleOAuthService.java` | OAuth2 token management | Token encryption, API integration |
| `GoogleAutoReplyService.java` | Auto-reply orchestration | Service composition |
| `GoogleReviewFetcherService.java` | Fetch reviews from Google | REST API consumption |
| `GoogleReviewReplierService.java` | Send replies to Google | REST API production |
| `GoogleReplyGeneratorService.java` | Generate reply text | ChatGPT integration |

### 10.4 Repository Files

| File | Entity | Custom Methods |
|------|--------|-----------------|
| `ClientRepository.java` | Client | findByEmail, findByMobile, findByAutoReplyEnabledTrue |
| `UserRepository.java` | UserDtls | findByEmail, existsByEmail |
| `ReviewGenerationLogRepository.java` | ReviewGenerationLog | findByCompanyName, findByTimestampBetween |
| `GoogleReplyLogRepository.java` | GoogleReplyLog | findByClientIdOrderByRepliedAtDesc |

### 10.5 Model Files

| File | Entity | Key Annotations |
|------|--------|-----------------|
| `Client.java` | clients table | @Entity, @Table, validation constraints, @Column definitions |
| `UserDtls.java` | user_details table | @Entity, @Table, @Id, validations |
| `ReviewGenerationLog.java` | review_generation_logs | @Entity, @Table, timestamp fields |
| `GoogleReplyLog.java` | google_reply_logs | @Entity, @Table, status tracking |

### 10.6 Configuration Files

| File | Purpose | Format |
|------|---------|--------|
| `application.properties` | Base configuration | Key=value |
| `application-dev.properties` | Dev profile config | Key=value |
| `application-prod.properties` | Prod profile config | Key=value |
| `pom.xml` | Maven dependencies | XML |
| `logback-spring.xml` | Logging configuration | XML |

### 10.7 Exception Handling Files

| File | Components | Pattern |
|------|-----------|---------|
| `GlobalExceptionHandler.java` | @ControllerAdvice, @ExceptionHandler methods | Centralized error handling |
| `ErrorResponse.java` | DTO for error responses | Structured error format |
| `OpenAIException.java` | Custom RuntimeException | Business-specific exception |
| `ResourceNotFoundException.java` | Custom exception | Resource not found handling |

### 10.8 Utility Files

| File | Purpose | Pattern |
|------|---------|---------|
| `TokenEncryptionUtil.java` | AES-256-GCM encryption | @Component, @Value, SecureRandom |
| `ClientDao.java` | Data Transfer Object | DAO pattern, field mapping |

### 10.9 Request/Response Files

| File | Purpose | Annotations |
|------|---------|-------------|
| `ChatGPTRequest.java` | OpenAI request DTO | @Data, @SerializedName, validations |
| `ChatGPTMessage.java` | Chat message structure | Regular class |
| `ChatGPTResponse.java` | OpenAI response DTO | @Data |
| `ChatGPTChoice.java` | Response choice wrapper | Regular class |
| `ChatGPTResponseMessage.java` | Response message | Regular class |
| `RegenerateReviewRequest.java` | Review regeneration request | DTO |
| `SearchRequest.java` | Search query DTO | DTO |

### 10.10 Scheduled Component Files

| File | Purpose | Scheduling |
|------|---------|------------|
| `GoogleReviewScheduler.java` | Automated task scheduling | @Scheduled(fixedDelay=300000, initialDelay=60000) |

---

## 11. COMPLETE TOPIC LIST

### Java Core Topics
- [x] Object-Oriented Programming (Encapsulation, Inheritance, Polymorphism, Abstraction)
- [x] Exception Handling (Try-catch-finally, custom exceptions, exception hierarchy)
- [x] Collections Framework (List, Optional, Map)
- [x] Streams API (map, filter, collect, groupBy, max, orElse)
- [x] Lambda Expressions (functional programming, method references)
- [x] Multithreading (scheduled tasks, thread pools via Spring)
- [x] File I/O (NIO, Files, Paths for upload handling)
- [x] String manipulation (regex patterns, URL encoding)
- [x] Type casting and generics

### Spring Framework Topics
- [x] Spring Boot Auto-Configuration
- [x] Component Scanning (@Component, @Service, @Repository, @Controller)
- [x] Dependency Injection (constructor, field, setter injection)
- [x] Bean Management (@Bean, @Configuration, Lifecycle)
- [x] Beans and Wiring (autowiring, component annotations)
- [x] Spring MVC (Controllers, RequestMapping, ModelAttribute, RedirectAttributes)
- [x] Spring Data JPA (Repositories, query methods, pagination)
- [x] Hibernate ORM (@Entity, @Table, @Id, @Column, mappings)
- [x] Spring Security (Authentication, Authorization, Filters, Exceptions)
- [x] Transaction Management (@Transactional, commit, rollback)
- [x] Scheduled Tasks (@EnableScheduling, @Scheduled)
- [x] Property Management (@Value, external configuration)
- [x] View Resolution (Thymeleaf template engine)

### Security Topics
- [x] Authentication (Form-based, OAuth2)
- [x] Authorization (RBAC, @PreAuthorize, SecurityFilterChain)
- [x] Password Encoding (BCrypt with adaptive rounds)
- [x] CSRF Protection (state parameter in OAuth)
- [x] HTTPS/TLS Configuration (HSTS, X-Forwarded-* headers)
- [x] Input Validation (JPA parameterized queries, Jakarta constraints)
- [x] SQL Injection Prevention (Spring Data JPA)
- [x] XSS Protection (Thymeleaf auto-escape, security headers)
- [x] Session Management (JSESSIONID, invalidation on logout)
- [x] Token Encryption (AES-256-GCM authenticated encryption)
- [x] API Security (@PreAuthorize, OAuth callbacks)
- [x] Security Headers (X-Frame-Options, X-Content-Type-Options, HSTS)

### Backend Architecture Topics
- [x] Layered Architecture (Controller → Service → Repository → Model)
- [x] MVC Pattern (Model, View, Controller separation)
- [x] Repository Pattern (data access abstraction)
- [x] Service Layer Pattern (business logic encapsulation)
- [x] DTO Pattern (Data Transfer Objects, request/response separation)
- [x] DAO Pattern (Data Access Object, field mapping)
- [x] Exception Handling (@ControllerAdvice, centralized error handling)
- [x] REST API Design (routing, HTTP methods, status codes)
- [x] Entity Mapping (JPA, Hibernate, column definitions)

### Database Topics
- [x] JPA Entities (@Entity, @Table, validations)
- [x] Hibernate Mapping (column definitions, constraints, relationships via foreignKey)
- [x] Repository Methods (derived queries, pagination)
- [x] Transactions (ACID properties, rollback, commit)
- [x] DDL Auto (schema creation/update)
- [x] Query Methods (findBy, existsBy, Containing, IgnoreCase)
- [x] Database Configuration (MySQL dialect, connection pooling)

### API Integration Topics
- [x] OpenAI ChatGPT API (HTTP POST, request/response handling)
- [x] Google OAuth2 (Authorization code flow, token management)
- [x] Google Business APIs (Account management, location data)
- [x] JSON Processing (Gson serialization/deserialization)
- [x] HTTP Clients (Apache HttpClient 5, RestTemplate)
- [x] Request/Response DTOs (validation, serialization)
- [x] Error Handling (API error codes, exception mapping)

### Configuration & Infrastructure Topics
- [x] Application Properties (externalized configuration, profiles)
- [x] Environment Variables (sensitive data, external secrets)
- [x] Logging Configuration (SLF4J, log levels, structured logging)
- [x] Server Configuration (Tomcat, port, header forwarding)
- [x] HTTPS Configuration (RemoteIpValve, proxy headers)
- [x] Security Headers (X-Frame-Options, HSTS, Content-Type-Options)
- [x] Profile-Specific Configuration (dev vs prod)

### Design Patterns Implemented
- [x] MVC Pattern (Model-View-Controller)
- [x] Repository Pattern (data access)
- [x] Service Layer Pattern (business logic)
- [x] DTO Pattern (data transfer)
- [x] Builder Pattern (object construction)
- [x] Factory Pattern (@Bean methods)
- [x] Singleton Pattern (Spring beans)
- [x] Adapter Pattern (CustomUserDetails)
- [x] Decorator Pattern (Security filters)
- [x] Template Method Pattern (Spring Security flow)
- [x] Dependency Injection Pattern (Spring managed)
- [x] Observer Pattern (Spring events, implicit)

### External Libraries
- [x] Gson (JSON serialization)
- [x] Apache HttpClient 5 (HTTP communication)
- [x] Jakarta XML Binding (XML support)
- [x] Lombok (code generation)
- [x] MySQL Connector (JDBC driver)
- [x] Spring Boot Weblibraries (embedded Tomcat, MVC, Security, Data JPA)

### Advanced Topics
- [x] Cryptography (AES-256-GCM encryption, BCrypt hashing)
- [x] URL Encoding (UTF-8 character encoding)
- [x] SecureRandom (cryptographically secure random generation)
- [x] Base64 Encoding (safe data representation)
- [x] Regex Pattern Matching (input validation)
- [x] File Upload Handling (MultipartFile, Files API)
- [x] Session Management (JSESSIONID, invalidation)
- [x] HTTP Headers (X-Frame-Options, HSTS, Content-Type)
- [x] CORS (implicit same-origin policy)

---

## SUMMARY FOR INTERVIEWS & PORTFOLIO

### Key Architectural Insights

**This project demonstrates:**

1. **Comprehensive Security Implementation**
   - Multi-layer defense (9 security layers)
   - OAuth2 integration with token encryption
   - Role-based access control
   - Secure by design with validation, encryption, and proper error handling

2. **Professional Layered Architecture**
   - Clear separation of concerns (Controller→Service→Repository)
   - Dependency injection throughout
   - Transaction management
   - Exception handling centralization

3. **Enterprise-Grade Patterns**
   - Repository pattern for data abstraction
   - Service layer for business logic
   - DTO pattern for API contracts
   - Configuration management for flexibility

4. **Integration Expertise**
   - OAuth2 flow implementation
   - Third-party API integration (OpenAI, Google)
   - Proper token management and encryption
   - Error handling and logging

5. **Modern Spring Boot Stack**
   - Spring Boot 3.2.3 with Java 17 LTS
   - Spring Security 6.x
   - Spring Data JPA with Hibernate
   - Thymeleaf template engine
   - MySQL database

**Perfect for roles:** Java Backend Developer, Spring Boot Developer, Java Security Engineer, Full-Stack Java Developer

---

**Report Generated:** March 16, 2026
**Framework Version:** Spring Boot 3.2.3
**Java Version:** Java 17 LTS
**Database:** MySQL 8.0
**Architecture Style:** Layered MVC with Microservice components

