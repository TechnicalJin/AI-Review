package com.yrhp.crud.response;

import lombok.Data;

import java.util.List;

@Data
public class ChatGPTResponse {

    private List<ChatGPTChoice> choices;

    public List<ChatGPTChoice> getChoices() {
        return choices;
    }

    public void setChoices(List<ChatGPTChoice> choices) {
        this.choices = choices;
    }
}