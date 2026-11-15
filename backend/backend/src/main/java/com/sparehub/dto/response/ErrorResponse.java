package com.sparehub.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        boolean success,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> validationErrors,
        LocalDateTime timestamp
) {

    public static ErrorResponse of(
            int status,
            String error,
            String message,
            String path
    ) {
        return new ErrorResponse(
                false,
                status,
                error,
                message,
                path,
                null,
                LocalDateTime.now()
        );
    }

    public static ErrorResponse validation(
            int status,
            String error,
            String message,
            String path,
            Map<String, String> validationErrors
    ) {
        return new ErrorResponse(
                false,
                status,
                error,
                message,
                path,
                validationErrors,
                LocalDateTime.now()
        );
    }
}