package com.yrhp.crud.request;

import com.google.gson.annotations.SerializedName;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.Arrays;
import java.util.List;

@Data
public class ChatGPTRequest {

    @NotBlank(message = "Model name cannot be blank")
    private String model = "gpt-4o-mini";

    @NotEmpty(message = "Messages list cannot be empty")
    private List<ChatGPTMessage> messages;

    @Min(value = 0, message = "Temperature must be at least 0")
    @Max(value = 2, message = "Temperature cannot exceed 2")
    private int temperature = 1;

    @SerializedName(value = "max_tokens")
    @Min(value = 1, message = "Max tokens must be at least 1")
    @Max(value = 4096, message = "Max tokens cannot exceed 4096")
    private int maxTokens = 256;

    public void setMessages(@NotBlank(message = "Message content cannot be blank") String messages) {
        this.messages = Arrays.asList(new ChatGPTMessage("user", messages));
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public List<ChatGPTMessage> getMessages() {
        return messages;
    }

    public void setMessages(List<ChatGPTMessage> messages) {
        this.messages = messages;
    }

    public int getTemperature() {
        return temperature;
    }

    public void setTemperature(int temperature) {
        this.temperature = temperature;
    }

    public int getMaxTokens() {
        return maxTokens;
    }

    public void setMaxTokens(int maxTokens) {
        this.maxTokens = maxTokens;
    }
}
