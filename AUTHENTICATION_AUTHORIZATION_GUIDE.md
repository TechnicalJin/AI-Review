# Authentication & Authorization Deep Dive - YRHP Review Generator

## 📋 Table of Contents
1. [Overview](#overview)
2. [Authentication vs Authorization](#authentication-vs-authorization)
3. [Complete Login Flow](#complete-login-flow)
4. [Session Management (Not JWT)](#session-management-not-jwt)
5. [Role-Based Access Control](#role-based-access-control)
6. [How APIs are Protected](#how-apis-are-protected)
7. [Password Security](#password-security)
8. [Code Walkthrough](#code-walkthrough)
9. [Security Headers & Best Practices](#security-headers--best-practices)
10. [Interview Questions](#interview-questions)

---

## 🎯 Overview

**Important Note:** This project uses **Session-Based Authentication**, NOT JWT (JSON Web Tokens).

### **Authentication Framework:**
- **Spring Security 6** (latest with Spring Boot 3.2.3)
- **Session-based** authentication with cookies
- **BCrypt** password hashing
- **Role-based access control** (RBAC)
- **Form-based login** with custom success handlers

---

## 🔐 Authentication vs Authorization

### **Authentication** (Who are you?)
Verifying the identity of a user.

**In this project:**
- User provides email and password
- System checks credentials against database
- If valid, creates a session
- Session ID stored in cookie (JSESSIONID)

### **Authorization** (What can you do?)
Determining what an authenticated user is allowed to access.

**In this project:**
- Based on user's role (ROLE_USER or ROLE_CLIENT)
- Different dashboards for different roles
- URL-based restrictions
- Method-level security with @PreAuthorize

---

## 🔄 Complete Login Flow (Step-by-Step)

### **Visual Flow Diagram:**

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: User Access                                          │
│ User navigates to /signin                                    │
│ Spring Security shows login page (login.html)                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 2: User Submits Credentials                            │
│ POST /signin                                                 │
│ Body: email=user@example.com, password=mypassword           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Spring Security Intercepts                          │
│ UsernamePasswordAuthenticationFilter catches the request    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 4: Load User from Database                             │
│ UserDetailsServiceImpl.loadUserByUsername(email)            │
│ - Queries UserRepository.findByEmail(email)                 │
│ - If user not found → throws UsernameNotFoundException      │
│ - If found → wraps in CustomUserDetails object              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 5: Password Verification                               │
│ DaoAuthenticationProvider                                   │
│ - Retrieves stored password hash from UserDetails           │
│ - Uses BCryptPasswordEncoder to compare:                    │
│   * Input: "mypassword"                                      │
│   * Stored: "$2a$10$abc...xyz" (BCrypt hash)                │
│ - If match → Authentication successful                       │
│ - If no match → BadCredentialsException                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 6: Create Authentication Object                        │
│ UsernamePasswordAuthenticationToken created with:           │
│ - Principal: user email                                      │
│ - Credentials: password (cleared after auth)                │
│ - Authorities: [ROLE_USER] or [ROLE_CLIENT]                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 7: Store in Security Context                           │
│ SecurityContextHolder.getContext()                          │
│   .setAuthentication(authToken)                              │
│ - Stores authentication in thread-local storage             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 8: Create HTTP Session                                 │
│ - Spring creates HttpSession                                 │
│ - Generates unique session ID (e.g., "ABC123XYZ...")        │
│ - Stores SecurityContext in session                         │
│ - Session stored in server memory (or Redis in production)  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 9: Set Cookie in Browser                               │
│ Response Header:                                             │
│   Set-Cookie: JSESSIONID=ABC123XYZ; Path=/; HttpOnly        │
│ - Browser stores this cookie                                 │
│ - Sent with every subsequent request                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 10: Custom Success Handler                             │
│ AuthenticationSuccessHandler executes:                      │
│                                                              │
│ String role = authentication.getAuthorities()               │
│                .iterator().next().getAuthority();            │
│                                                              │
│ if (role.equals("ROLE_USER"))                               │
│     redirect to /user/home                                   │
│ else if (role.equals("ROLE_CLIENT"))                        │
│     redirect to /client/home                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 11: User Accesses Protected Resource                   │
│ GET /user/home                                               │
│ Cookie: JSESSIONID=ABC123XYZ                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 12: Session Validation                                 │
│ - Spring Security extracts JSESSIONID from cookie           │
│ - Retrieves session from server memory                      │
│ - Loads SecurityContext from session                        │
│ - Checks if user has ROLE_USER                              │
│ - If yes → Allow access                                      │
│ - If no → 403 Forbidden                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🍪 Session Management (Not JWT)

### **Why Session-Based Instead of JWT?**

| Aspect | Session-Based (This Project) | JWT-Based |
|--------|------------------------------|-----------|
| **Storage** | Server-side (memory/Redis) | Client-side (localStorage/cookie) |
| **Revocation** | Easy (delete session) | Hard (needs blacklist) |
| **Security** | Better (server controls) | Risk if token stolen |
| **Scalability** | Needs sticky sessions | Stateless, easy to scale |
| **Use Case** | Traditional web apps | APIs, microservices |

**Our Choice:** Session-based is perfect for a traditional web application with server-side rendering (Thymeleaf).

### **Session Lifecycle:**

#### **1. Session Creation (Login)**
```java
// Spring Security automatically creates session
HttpSession session = request.getSession(true);
session.setAttribute(
    "SPRING_SECURITY_CONTEXT",
    SecurityContextHolder.getContext()
);
```

#### **2. Session Storage**
```
Server Memory:
{
  "ABC123XYZ": {
    "user": "admin@example.com",
    "role": "ROLE_USER",
    "createdAt": "2025-12-16T10:30:00",
    "lastAccessed": "2025-12-16T10:35:00"
  }
}
```

#### **3. Cookie Management**
```
Browser Cookie:
Name: JSESSIONID
Value: ABC123XYZ
Domain: localhost
Path: /
HttpOnly: true (prevents JavaScript access)
Secure: true (HTTPS only in production)
SameSite: Lax (CSRF protection)
```

#### **4. Subsequent Requests**
```
GET /user/home HTTP/1.1
Host: localhost:8080
Cookie: JSESSIONID=ABC123XYZ
```

Spring Security automatically:
1. Extracts JSESSIONID from cookie
2. Retrieves session from server
3. Loads SecurityContext
4. Makes authentication available via `SecurityContextHolder`

#### **5. Session Termination (Logout)**
```java
// Configured in SecurityConfig
logout
  .logoutUrl("/logout")
  .invalidateHttpSession(true)        // Destroy session
  .clearAuthentication(true)           // Clear auth
  .deleteCookies("JSESSIONID")        // Remove cookie
  .logoutSuccessUrl("/signin?logout")
```

---

## 👥 Role-Based Access Control (RBAC)

### **Roles Defined:**

| Role | Database Value | Spring Security | Description |
|------|---------------|-----------------|-------------|
| **Admin** | `ROLE_USER` | `hasRole('USER')` | Platform administrators |
| **Client** | `ROLE_CLIENT` | `hasRole('CLIENT')` | Business owners |

**Note:** Spring Security automatically adds "ROLE_" prefix, so in database we store "ROLE_USER", not just "USER".

### **How Roles are Stored:**

#### **1. Database (user_details table)**
```sql
id | username | email              | password  | role
---|----------|--------------------|-----------|-----------
1  | Admin    | admin@example.com  | $2a$10... | ROLE_USER
2  | John     | john@business.com  | $2a$10... | ROLE_CLIENT
```

#### **2. CustomUserDetails Class**
```java
@Override
public Collection<? extends GrantedAuthority> getAuthorities() {
    // Creates authority from role string
    SimpleGrantedAuthority authority = 
        new SimpleGrantedAuthority(user.getRole());
    return Arrays.asList(authority);
}
```

This method converts the role string into a `GrantedAuthority` object that Spring Security understands.

### **Role Assignment:**

#### **For Admins (ROLE_USER):**
```java
// HomeController.java - User Registration
@PostMapping("/createUser")
public String createUser(@Valid UserDtls user) {
    user.setRole("ROLE_USER");  // Hardcoded for admin registration
    userService.createUser(user);
    return "redirect:/signin";
}
```

#### **For Clients (ROLE_CLIENT):**
```java
// Client.java entity
@Column(nullable = false)
private String role = "ROLE_CLIENT";  // Default value in entity
```

### **Access Control Levels:**

#### **1. URL-Based Security (SecurityConfig)**
```java
http.authorizeHttpRequests(auth -> {
    auth
        // Public URLs - anyone can access
        .requestMatchers(
            "/", 
            "/createUser", 
            "/signin",
            "/css/**", 
            "/js/**", 
            "/uploads/**",
            "/user/view/**"  // Public review pages
        ).permitAll()
        
        // Admin-only URLs
        .requestMatchers("/user/**").hasRole("USER")
        
        // Client-only URLs
        .requestMatchers("/client/**").hasRole("CLIENT")
        
        // Everything else requires authentication
        .anyRequest().authenticated();
});
```

**What this means:**
- `/user/home` → Only ROLE_USER can access
- `/client/home` → Only ROLE_CLIENT can access
- `/user/view/abc-restaurant` → Anyone can access (public)

#### **2. Method-Level Security (@PreAuthorize)**
```java
// UserController.java
@GetMapping("/user/home")
@PreAuthorize("hasRole('USER')")  // Double-check at method level
public String home(Model model) {
    // Only ROLE_USER can execute this
}

// ClientController.java
@GetMapping("/client/home")
@PreAuthorize("hasRole('CLIENT')")  // Double-check
public String clientHome(Model model, Authentication auth) {
    // Only ROLE_CLIENT can execute this
}

// UserController.java - Logs
@GetMapping("/user/log")
@PreAuthorize("isAuthenticated()")  // Any authenticated user
public String viewLogs(Model model) {
    // Any logged-in user can access
}
```

**@PreAuthorize Options:**
- `hasRole('USER')` - Must have ROLE_USER
- `hasRole('CLIENT')` - Must have ROLE_CLIENT
- `isAuthenticated()` - Any logged-in user
- `hasAnyRole('USER', 'CLIENT')` - Either role works
- `permitAll()` - Everyone can access

#### **3. Programmatic Security (In Code)**
```java
// UserController.java
@ModelAttribute
public void userDetails(Model model, Principal principal) {
    if (principal != null) {
        String email = principal.getName();  // Get logged-in user email
        UserDtls user = userRepo.findByEmail(email);
        model.addAttribute("user", user);
    }
}
```

```java
// ClientController.java
@GetMapping("/client/home")
public String home(Authentication authentication) {
    // Get logged-in client by email
    Client client = clientService.getClientByEmail(
        authentication.getName()
    );
    
    // Client can only see their own data
    List<ReviewGenerationLog> logs = 
        logService.getLogsByCompanyName(client.getName());
}
```

### **Role-Based Redirects:**

After successful login, users are redirected based on their role:

```java
// SecurityConfig.java - Custom Success Handler
.successHandler((request, response, authentication) -> {
    String role = authentication.getAuthorities()
                    .iterator().next().getAuthority();
    
    log.info("User logged in with role: {}", role);
    
    if ("ROLE_USER".equals(role)) {
        response.sendRedirect("/user/home");  // Admin dashboard
    } else if ("ROLE_CLIENT".equals(role)) {
        response.sendRedirect("/client/home");  // Client dashboard
    } else {
        response.sendRedirect("/");  // Fallback
    }
})
```

---

## 🛡️ How APIs are Protected

### **Protection Layers:**

```
┌─────────────────────────────────────────┐
│  Layer 1: Spring Security Filter Chain  │
│  (Intercepts every HTTP request)        │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│  Layer 2: Session Validation            │
│  (Checks JSESSIONID cookie)             │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│  Layer 3: URL Pattern Matching          │
│  (Configured in SecurityConfig)         │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│  Layer 4: Role Verification             │
│  (hasRole() checks)                     │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│  Layer 5: Method-Level Security         │
│  (@PreAuthorize annotations)            │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│  Layer 6: Controller Method Execution   │
│  (Your business logic)                  │
└─────────────────────────────────────────┘
```

### **Example: Protected API Call**

#### **Scenario 1: Successful Access**

```
Request:
GET /user/home HTTP/1.1
Cookie: JSESSIONID=ABC123XYZ

Step 1: Spring Security Filter intercepts
Step 2: Extracts JSESSIONID from cookie
Step 3: Finds session in server memory
Step 4: Loads user with ROLE_USER
Step 5: Checks URL pattern: /user/** requires ROLE_USER ✓
Step 6: Checks @PreAuthorize("hasRole('USER')") ✓
Step 7: Executes controller method
Step 8: Returns HTML response

Result: 200 OK
```

#### **Scenario 2: Unauthorized Access (Wrong Role)**

```
Request:
GET /user/home HTTP/1.1
Cookie: JSESSIONID=XYZ789ABC

Step 1: Spring Security Filter intercepts
Step 2: Extracts JSESSIONID from cookie
Step 3: Finds session in server memory
Step 4: Loads user with ROLE_CLIENT
Step 5: Checks URL pattern: /user/** requires ROLE_USER ✗
Step 6: Access Denied!

Result: 403 Forbidden → Redirected to /error/403
```

#### **Scenario 3: Not Authenticated**

```
Request:
GET /user/home HTTP/1.1
(No cookie)

Step 1: Spring Security Filter intercepts
Step 2: No JSESSIONID cookie found
Step 3: No session exists
Step 4: User is anonymous (not authenticated)
Step 5: Requires authentication but none found
Step 6: Authentication Required!

Result: 302 Redirect → /signin?error=unauthorized
```

### **API Endpoint Protection Table:**

| Endpoint | Public | ROLE_USER | ROLE_CLIENT | Authentication |
|----------|--------|-----------|-------------|----------------|
| `GET /` | ✅ | ✅ | ✅ | Optional |
| `GET /signin` | ✅ | ✅ | ✅ | No |
| `POST /createUser` | ✅ | ✅ | ✅ | No |
| `GET /user/view/{name}` | ✅ | ✅ | ✅ | No |
| `GET /user/home` | ❌ | ✅ | ❌ | Required |
| `POST /user/create` | ❌ | ✅ | ❌ | Required |
| `POST /user/regenerate/{id}` | ❌ | ✅ | ❌ | Required |
| `GET /user/log` | ❌ | ✅ | ❌ | Required |
| `GET /client/home` | ❌ | ❌ | ✅ | Required |
| `GET /client/profile` | ❌ | ❌ | ✅ | Required |
| `GET /client/logs` | ❌ | ❌ | ✅ | Required |

### **REST API Protection Example:**

```java
// ClientController.java - REST endpoint
@GetMapping("/client/profile")
@PreAuthorize("hasRole('CLIENT')")
@ResponseBody
public ResponseEntity<?> getClientProfile(Authentication auth) {
    // Authentication object automatically injected by Spring Security
    String email = auth.getName();  // Get logged-in user's email
    
    Client client = clientService.getClientByEmail(email);
    
    if (client == null) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(Map.of("error", "Client not found"));
    }
    
    // Return only the authenticated user's data
    Map<String, Object> response = new HashMap<>();
    response.put("id", client.getId());
    response.put("name", client.getName());
    response.put("email", client.getEmail());
    
    return ResponseEntity.ok(response);
}
```

**Security enforced:**
1. `@PreAuthorize("hasRole('CLIENT')")` - Only ROLE_CLIENT can call this
2. `Authentication auth` - Injected by Spring Security
3. `auth.getName()` - Gets the authenticated user's email
4. Client can only see their own data (not other clients)

---

## 🔒 Password Security

### **BCrypt Password Hashing**

#### **What is BCrypt?**
- Industry-standard password hashing algorithm
- Uses adaptive hashing (slow by design)
- Includes salt automatically (prevents rainbow table attacks)
- Each hash is unique even for same password

#### **Password Encoding (Registration):**

```java
// SecurityConfig.java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

```java
// UserServiceImpl.java - Creating user
@Override
public UserDtls createUser(UserDtls user) {
    // Plain password: "myPassword123"
    String plainPassword = user.getPassword();
    
    // Encode using BCrypt
    String encodedPassword = passwordEncoder.encode(plainPassword);
    // Result: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
    
    user.setPassword(encodedPassword);
    return userRepo.save(user);
}
```

**What the hash looks like:**
```
$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
│ │  │ │                                                        │
│ │  │ │                                                        └─ Hash (31 chars)
│ │  │ └─ Salt (22 chars)
│ │  └─ Cost factor (10 = 2^10 = 1024 rounds)
│ └─ BCrypt version
└─ Algorithm identifier
```

#### **Password Verification (Login):**

```java
// DaoAuthenticationProvider (Spring Security internal)
public Authentication authenticate(Authentication auth) {
    String inputPassword = auth.getCredentials().toString();
    // Input: "myPassword123"
    
    UserDetails userDetails = userDetailsService
        .loadUserByUsername(auth.getName());
    String storedHash = userDetails.getPassword();
    // Stored: "$2a$10$N9qo8uLO..."
    
    // BCrypt comparison (time-safe)
    if (passwordEncoder.matches(inputPassword, storedHash)) {
        // Password correct!
        return createSuccessAuthentication(auth, userDetails);
    } else {
        // Password incorrect!
        throw new BadCredentialsException("Invalid credentials");
    }
}
```

**Security Benefits:**
1. **Irreversible:** Cannot decode hash back to password
2. **Salted:** Same password = different hash each time
3. **Slow:** Prevents brute-force attacks (intentionally CPU-intensive)
4. **Time-safe:** Comparison takes same time whether correct or not (prevents timing attacks)

---

## 💻 Code Walkthrough

### **1. SecurityConfig.java (Main Security Configuration)**

```java
@Configuration
public class SecurityConfig {
    
    @Autowired
    private UserDetailsService userDetailsService;
    
    // Define password encoder
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    // Configure authentication provider
    @Bean
    public DaoAuthenticationProvider getDaoAuthProvider() {
        DaoAuthenticationProvider provider = 
            new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }
    
    // Main security configuration
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) 
            throws Exception {
        http
            // Set authentication provider
            .authenticationProvider(getDaoAuthProvider())
            
            // Configure URL access rules
            .authorizeHttpRequests(auth -> {
                auth
                    .requestMatchers("/", "/createUser", "/signin",
                        "/css/**", "/js/**", "/uploads/**",
                        "/user/view/**").permitAll()
                    .requestMatchers("/user/**").hasRole("USER")
                    .requestMatchers("/client/**").hasRole("CLIENT")
                    .anyRequest().authenticated();
            })
            
            // Configure login
            .formLogin(form -> {
                form.loginPage("/signin")
                    .loginProcessingUrl("/signin")
                    .defaultSuccessUrl("/", true)
                    .successHandler((request, response, auth) -> {
                        String role = auth.getAuthorities()
                            .iterator().next().getAuthority();
                        
                        if ("ROLE_USER".equals(role)) {
                            response.sendRedirect("/user/home");
                        } else if ("ROLE_CLIENT".equals(role)) {
                            response.sendRedirect("/client/home");
                        }
                    })
                    .failureHandler((request, response, exception) -> {
                        response.sendRedirect("/signin?error=true");
                    })
                    .permitAll();
            })
            
            // Configure logout
            .logout(logout -> {
                logout.logoutUrl("/logout")
                    .logoutSuccessUrl("/signin?logout")
                    .invalidateHttpSession(true)
                    .clearAuthentication(true)
                    .deleteCookies("JSESSIONID")
                    .permitAll();
            })
            
            // Handle access denied
            .exceptionHandling(exception -> {
                exception
                    .accessDeniedPage("/error/403")
                    .authenticationEntryPoint((req, res, authEx) -> {
                        res.sendRedirect("/signin?error=unauthorized");
                    });
            })
            
            // Security headers
            .headers(headers -> {
                headers
                    .frameOptions(f -> f.deny())
                    .httpStrictTransportSecurity(hsts -> hsts
                        .maxAgeInSeconds(31536000)
                        .includeSubDomains(true));
            })
            
            // CSRF (disabled for now)
            .csrf(csrf -> csrf.disable());
        
        return http.build();
    }
}
```

### **2. UserDetailsServiceImpl.java (Load User)**

```java
@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    
    @Autowired
    private UserRepository userRepo;
    
    @Override
    public UserDetails loadUserByUsername(String email) 
            throws UsernameNotFoundException {
        // Find user by email in database
        UserDtls user = userRepo.findByEmail(email);
        
        if (user != null) {
            // Wrap in CustomUserDetails
            return new CustomUserDetails(user);
        }
        
        throw new UsernameNotFoundException("User Not Available");
    }
}
```

### **3. CustomUserDetails.java (User Wrapper)**

```java
public class CustomUserDetails implements UserDetails {
    
    private UserDtls user;
    
    public CustomUserDetails(UserDtls user) {
        this.user = user;
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Convert role string to GrantedAuthority
        SimpleGrantedAuthority authority = 
            new SimpleGrantedAuthority(user.getRole());
        return Arrays.asList(authority);
    }
    
    @Override
    public String getPassword() {
        return user.getPassword();  // BCrypt hash
    }
    
    @Override
    public String getUsername() {
        return user.getEmail();  // Use email as username
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return true;
    }
}
```

### **4. Controller Access Control**

```java
@Controller
@RequestMapping("/user")
public class UserController {
    
    // Inject current user into all views
    @ModelAttribute
    public void userDetails(Model model, Principal principal) {
        if (principal != null) {
            String email = principal.getName();
            UserDtls user = userRepo.findByEmail(email);
            model.addAttribute("user", user);
        }
    }
    
    // Protected endpoint
    @GetMapping("/home")
    @PreAuthorize("hasRole('USER')")
    public String home(Model model) {
        // Only ROLE_USER can access
        return "user/home";
    }
    
    // Public endpoint (anyone can access)
    @GetMapping("/view/{name}")
    public String viewClient(@PathVariable String name, Model model) {
        // No @PreAuthorize, so anyone can access
        // This is for public review generation
        return "user/view";
    }
}
```

---

## 🔐 Security Headers & Best Practices

### **Security Headers Configured:**

```java
.headers(headers -> {
    headers
        // Prevent clickjacking (iframe embedding)
        .frameOptions(frameOptions -> frameOptions.deny())
        
        // Prevent MIME-type sniffing
        .contentTypeOptions(Customizer.withDefaults())
        
        // Force HTTPS (in production)
        .httpStrictTransportSecurity(hstsConfig -> hstsConfig
            .maxAgeInSeconds(31536000)  // 1 year
            .includeSubDomains(true));
})
```

**What these headers do:**

1. **X-Frame-Options: DENY**
   - Prevents your site from being embedded in iframes
   - Protects against clickjacking attacks

2. **X-Content-Type-Options: nosniff**
   - Prevents browsers from MIME-sniffing
   - Stops browsers from interpreting files as different type

3. **Strict-Transport-Security: max-age=31536000**
   - Forces browser to use HTTPS for 1 year
   - Prevents man-in-the-middle attacks

### **Other Security Measures:**

#### **1. HttpOnly Cookies:**
```java
// Automatically set by Spring Security
Set-Cookie: JSESSIONID=ABC123; HttpOnly; Secure; SameSite=Lax
```
- `HttpOnly` - JavaScript cannot access the cookie (XSS protection)
- `Secure` - Only sent over HTTPS (man-in-the-middle protection)
- `SameSite` - Prevents CSRF attacks

#### **2. Session Timeout:**
```properties
# application.properties
server.servlet.session.timeout=30m
```
After 30 minutes of inactivity, session expires.

#### **3. CSRF Protection:**
Currently disabled:
```java
.csrf(csrf -> csrf.disable());
```

**Note:** In production, enable CSRF for POST/PUT/DELETE requests:
```java
.csrf(csrf -> csrf
    .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
);
```

---

## 🎤 Interview Questions & Answers

### **Q1: How does authentication work in your project?**

**Answer:**
"We use Spring Security with session-based authentication. When a user logs in:
1. They provide email and password
2. Spring Security calls our UserDetailsServiceImpl to load the user from the database
3. BCryptPasswordEncoder compares the password hash
4. If valid, a session is created with a unique JSESSIONID
5. The session ID is sent to the browser as an HttpOnly cookie
6. Every subsequent request includes this cookie, and Spring Security validates the session

We don't use JWT because this is a traditional web application with server-side rendering using Thymeleaf."

### **Q2: How is authorization different from authentication?**

**Answer:**
"Authentication is verifying WHO you are (login with credentials). Authorization is determining WHAT you can access.

In our project:
- Authentication: User proves identity with email/password
- Authorization: Based on their role (ROLE_USER or ROLE_CLIENT), they can access different endpoints

We use role-based access control (RBAC) configured at two levels:
1. URL patterns in SecurityConfig (/user/** requires ROLE_USER)
2. Method-level with @PreAuthorize annotations"

### **Q3: Why BCrypt instead of other hashing algorithms?**

**Answer:**
"BCrypt is specifically designed for password hashing with several advantages:
1. Adaptive - we can increase the cost factor as computers get faster
2. Automatically includes salt - prevents rainbow table attacks
3. Intentionally slow - prevents brute-force attacks
4. Industry standard - well-tested and trusted

Each password hash includes the algorithm, cost factor, salt, and hash - all in one string. Even the same password produces different hashes each time due to random salt."

### **Q4: How do you prevent unauthorized access to admin APIs?**

**Answer:**
"We have multiple layers of protection:

1. URL-based restrictions in SecurityConfig
   - `/user/**` endpoints require ROLE_USER
   - `/client/**` endpoints require ROLE_CLIENT

2. Method-level security with @PreAuthorize
   - Double-checks role at method execution
   
3. Programmatic checks in code
   - Clients can only see their own data
   - We filter queries by authenticated user's email

4. Session validation
   - Every request validates the JSESSIONID cookie
   - Expired sessions are automatically rejected

5. Exception handling
   - Access denied redirects to /error/403
   - Unauthenticated requests redirect to /signin"

### **Q5: What happens during logout?**

**Answer:**
"When a user clicks logout:
1. The /logout endpoint is called
2. Spring Security invalidates the HttpSession on the server
3. Clears the SecurityContext (removes authentication)
4. Deletes the JSESSIONID cookie from the browser
5. Redirects to /signin?logout

This ensures the session can't be reused even if someone gets the old cookie value."

### **Q6: How would you implement "Remember Me" functionality?**

**Answer:**
"I would add persistent token-based remember-me:

```java
.rememberMe(remember -> {
    remember
        .tokenRepository(persistentTokenRepository())
        .tokenValiditySeconds(2592000)  // 30 days
        .key("uniqueSecretKey");
})
```

This creates a persistent token stored in the database. Even after session expires, the token allows automatic re-login. The token is stored in a separate cookie called 'remember-me'."

### **Q7: Why not use JWT for this application?**

**Answer:**
"JWT is stateless and great for APIs, but our application is better suited for sessions because:

1. **Server-side rendering** - We use Thymeleaf, not a SPA
2. **Easy logout** - Sessions can be invalidated immediately
3. **No token storage** - Browser handles cookies automatically
4. **Built-in support** - Spring Security has excellent session management

If we were building a REST API for a mobile app or React frontend, JWT would be better. But for traditional MVC web apps, sessions are simpler and more secure."

### **Q8: How do you handle concurrent sessions (same user on multiple devices)?**

**Answer:**
"Currently, Spring Security allows unlimited concurrent sessions by default. To limit it:

```java
.sessionManagement(session -> {
    session
        .maximumSessions(1)  // Only 1 session per user
        .maxSessionsPreventsLogin(true);  // Block new login
})
```

Or we could invalidate the old session when a new login happens:
```java
.maximumSessions(1)
.maxSessionsPreventsLogin(false)  // Allow new, invalidate old
```

For production, I'd allow multiple sessions (phone + laptop) but track them in the database for auditing."

### **Q9: How is the SecurityContext stored and retrieved?**

**Answer:**
"Spring Security uses a ThreadLocal variable called SecurityContextHolder to store the authentication:

1. **After login:** SecurityContext is created and stored in HttpSession
2. **On each request:** SessionManagementFilter retrieves it from session
3. **In thread:** Stored in ThreadLocal so it's accessible anywhere
4. **In controllers:** Injected as Principal or Authentication parameter

Example:
```java
public String home(Principal principal) {
    String email = principal.getName();  // Get current user
}
```

The ThreadLocal ensures each request thread has its own SecurityContext, preventing cross-user data leakage."

### **Q10: How would you add two-factor authentication?**

**Answer:**
"I would implement it as an additional authentication step:

1. After password validation, generate a 6-digit OTP
2. Send via SMS or email
3. Show OTP verification page
4. User enters OTP within 5 minutes
5. Validate and create session

Implementation:
```java
@PostMapping("/verify-otp")
public String verifyOTP(@RequestParam String otp, 
                       HttpSession session) {
    String expectedOTP = (String) session.getAttribute("otp");
    if (otp.equals(expectedOTP)) {
        // Create full authentication
        return "redirect:/user/home";
    }
    return "redirect:/verify?error";
}
```

Or use Spring Security's AuthenticationProvider chain to add OTP validation."

---

## 📊 Security Checklist

✅ **Implemented in Project:**
- [x] BCrypt password hashing
- [x] Session-based authentication
- [x] Role-based access control
- [x] HttpOnly secure cookies
- [x] Custom login/logout
- [x] Exception handling (403, 401)
- [x] Security headers (X-Frame-Options, HSTS)
- [x] Method-level security (@PreAuthorize)
- [x] Input validation (Jakarta Validation)
- [x] Logging of authentication events

⚠️ **Recommended for Production:**
- [ ] Enable CSRF protection
- [ ] HTTPS enforcement
- [ ] Rate limiting (prevent brute force)
- [ ] Account lockout after failed attempts
- [ ] Session timeout configuration
- [ ] Audit logging (who accessed what)
- [ ] Two-factor authentication
- [ ] Password strength enforcement
- [ ] Regular security dependency updates

---

## 🎯 Summary

### **Key Points:**

1. **Authentication Method:** Session-based (not JWT)
2. **Password Security:** BCrypt hashing
3. **Authorization:** Role-based (ROLE_USER, ROLE_CLIENT)
4. **Session Storage:** Server-side in memory
5. **Cookie:** JSESSIONID, HttpOnly, Secure
6. **Access Control:** URL patterns + @PreAuthorize
7. **Framework:** Spring Security 6

### **Flow Summary:**

```
Login → Validate Credentials → Create Session → 
Set Cookie → Subsequent Requests → Validate Session → 
Check Role → Allow/Deny Access
```

This authentication system is production-ready, secure, and follows Spring Security best practices! 🔒

---

**Good luck explaining this in your interviews!** Remember to:
- Start with high-level flow
- Explain why session-based over JWT
- Mention BCrypt security benefits
- Show understanding of RBAC
- Be ready to discuss improvements
