package com.example.inventory.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when a requested resource cannot be found in the database.
 *
 * <p>{@code @ResponseStatus(HttpStatus.NOT_FOUND)} causes Spring MVC to return an HTTP
 * {@code 404 Not Found} response whenever this exception propagates out of a controller
 * method. The {@link GlobalExceptionHandler} also catches it explicitly so that the
 * response body is consistent with all other error responses in this API.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    /**
     * Constructs a new exception with the supplied detail message.
     *
     * @param message human-readable description of the missing resource,
     *                e.g. {@code "Item not found with id: 42"}
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
