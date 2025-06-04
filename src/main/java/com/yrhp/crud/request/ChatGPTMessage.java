package com.yrhp.crud.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChatGPTMessage {

    @NotBlank(message = "Role cannot be blank")
    @Size(max = 20, message = "Role cannot exceed 20 characters")
    private String role;

    @NotBlank(message = "Content cannot be blank")
    @Size(max = 500, message = "Content cannot exceed 500 characters")
    private String content;

    public ChatGPTMessage(String role, String content) {
        this.role = role;
        this.content = content;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
