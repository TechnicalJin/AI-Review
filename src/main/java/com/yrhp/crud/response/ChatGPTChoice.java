package com.yrhp.crud.response;

import lombok.Data;

@Data
public class ChatGPTChoice {
    private ChatGPTResponseMessage message;

    public ChatGPTResponseMessage getMessage() {
        return message;
    }

    public void setMessage(ChatGPTResponseMessage message) {
        this.message = message;
    }
}