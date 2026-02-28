package com.example.employees;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for the Spring Boot application.
 * @SpringBootApplication combines:
 *   - @Configuration: marks class as bean definition source
 *   - @EnableAutoConfiguration: auto-configures Spring based on classpath
 *   - @ComponentScan: scans this package for components
 */
@SpringBootApplication
public class EmployeesApplication {
    public static void main(String[] args) {
        SpringApplication.run(EmployeesApplication.class, args);
    }
}
