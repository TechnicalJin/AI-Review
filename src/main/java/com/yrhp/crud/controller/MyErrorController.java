package com.yrhp.crud.controller;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class MyErrorController implements ErrorController {
    private static final Logger log = LoggerFactory.getLogger(MyErrorController.class);

    @RequestMapping("/error")
    public String handleError(HttpServletRequest request, Model model) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        String path = (String) request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);

        if (status != null) {
            int statusCode = Integer.parseInt(status.toString());
            String errorMessage = HttpStatus.resolve(statusCode) != null
                    ? HttpStatus.resolve(statusCode).getReasonPhrase()
                    : "Unknown Error";

            log.error("Error {} ({}) occurred at path: {}", statusCode, errorMessage, path);

            model.addAttribute("errorCode", statusCode);
            model.addAttribute("errorMessage", errorMessage);
            model.addAttribute("path", path);

            if (statusCode == HttpStatus.NOT_FOUND.value()) {
                log.warn("Resource not found: {}", path);
                return "error/404";
            }
            else if (statusCode == HttpStatus.INTERNAL_SERVER_ERROR.value()) {
                log.error("Internal server error occurred at {}", path);
                return "error/500";
            }
        } else {
            log.warn("Unknown error occurred at path: {}", path);
            model.addAttribute("errorMessage", "An unexpected error occurred");
        }

        // Log additional error details
        log.debug("Error details - [Servlet Name: {}, Exception Type: {}]",
                request.getAttribute(RequestDispatcher.ERROR_SERVLET_NAME),
                request.getAttribute(RequestDispatcher.ERROR_EXCEPTION_TYPE));

        return "error/error";
    }
}