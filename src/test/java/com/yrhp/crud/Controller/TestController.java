package com.yrhp.crud.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
public class TestController {
    
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(new Object() {
            public String status = "Backend is running!";
            public long timestamp = System.currentTimeMillis();
        });
    }
    
    @PostMapping("/echo")
    public ResponseEntity<?> echo(@RequestBody String message) {
        return ResponseEntity.ok(new Object() {
            public String echo = message;
            public long timestamp = System.currentTimeMillis();
        });
    }
}