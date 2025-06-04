package com.yrhp.crud.response;

import lombok.Data;

@Data
public class ChatGPTResponseMessage {
    String content;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
