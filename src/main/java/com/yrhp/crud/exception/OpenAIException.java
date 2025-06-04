package com.yrhp.crud.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class OpenAIException extends RuntimeException {
    private static final Logger log = LoggerFactory.getLogger(OpenAIException.class);

    public OpenAIException(String message) {
        super(message);
        log.debug("Creating OpenAIException: {}", message);
    }

    public OpenAIException(String message, Throwable cause) {
        super(message, cause);
        log.debug("Creating OpenAIException with cause: {} - {}", message, cause.toString());
    }
}