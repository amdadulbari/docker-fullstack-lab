package com.example.inventory.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Centralised exception handling for all controllers in this application.
 *
 * <p>{@code @RestControllerAdvice} is a composed annotation that combines
 * {@code @ControllerAdvice} and {@code @ResponseBody}. It intercepts exceptions thrown by
 * any {@code @RestController} and allows them to be handled in one place instead of
 * spreading try/catch blocks across every controller method.
 *
 * <p>Each {@code @ExceptionHandler} method maps one (or more) exception types to a
 * specific HTTP status code and a structured JSON error body.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    // -------------------------------------------------------------------------
    // 404 Not Found
    // -------------------------------------------------------------------------

    /**
     * Handles {@link ResourceNotFoundException} thrown when an entity with the requested ID
     * does not exist.
     *
     * @param ex the caught exception
     * @return 404 response with an error body
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFound(ResourceNotFoundException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), null);
    }

    // -------------------------------------------------------------------------
    // 400 Bad Request — Bean Validation failures
    // -------------------------------------------------------------------------

    /**
     * Handles {@link MethodArgumentNotValidException} raised when a request body annotated
     * with {@code @Valid} fails Bean Validation constraints.
     *
     * <p>The response body includes a {@code fieldErrors} map whose keys are field names and
     * values are the first validation message for each field:
     * <pre>{@code
     * {
     *   "error":       "Validation failed",
     *   "message":     "One or more fields have invalid values",
     *   "timestamp":   "2026-02-27T12:00:00",
     *   "fieldErrors": {
     *     "name":  "Item name must not be blank",
     *     "price": "Price must be zero or positive"
     *   }
     * }
     * }</pre>
     *
     * @param ex the caught validation exception
     * @return 400 response with field-level error details
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            MethodArgumentNotValidException ex) {

        Map<String, String> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "Invalid value",
                        // keep first error per field if there are multiple
                        (first, second) -> first
                ));

        Map<String, Object> body = buildErrorBody(
                HttpStatus.BAD_REQUEST, "Validation failed", "One or more fields have invalid values");
        body.put("fieldErrors", fieldErrors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    // -------------------------------------------------------------------------
    // 500 Internal Server Error — catch-all
    // -------------------------------------------------------------------------

    /**
     * Catch-all handler for any unhandled exception. Returns a generic 500 response so that
     * stack traces and internal details are never leaked to API clients.
     *
     * @param ex the caught exception
     * @return 500 response with a sanitised error message
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred",
                ex.getMessage());
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private ResponseEntity<Map<String, Object>> buildResponse(
            HttpStatus status, String error, String detail) {

        Map<String, Object> body = buildErrorBody(status, error, detail);
        return ResponseEntity.status(status).body(body);
    }

    private Map<String, Object> buildErrorBody(HttpStatus status, String error, String detail) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", error);
        if (detail != null) {
            body.put("message", detail);
        }
        return body;
    }
}
