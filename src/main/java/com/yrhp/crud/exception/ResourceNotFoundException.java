package com.yrhp.crud.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ResourceNotFoundException extends RuntimeException {
    private static final Logger log = LoggerFactory.getLogger(ResourceNotFoundException.class);

    public ResourceNotFoundException(String message) {
        super(message);
        log.debug("Creating ResourceNotFoundException: {}", message);
    }
}