package com.yrhp.crud.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ErrorResponse {

    private static final Logger logger = LoggerFactory.getLogger(ErrorResponse.class);

    private int status;
    private String message;

    public ErrorResponse(int status, String message) {
        logger.debug("Creating ErrorResponse : {} - {}", status, message);
        this.status = status;
        this.message = message;
    }

    public int getStatus() {
        return status;
    }

    public String getMessage() {
        return message;
    }
} 