package com.example.inventory;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the Inventory API Spring Boot application.
 *
 * <p>The {@code @SpringBootApplication} annotation is a convenience meta-annotation that combines:
 * <ul>
 *   <li>{@code @Configuration} — marks this class as a source of Spring bean definitions,
 *       equivalent to an XML application context file.</li>
 *   <li>{@code @EnableAutoConfiguration} — tells Spring Boot to automatically configure the
 *       application context based on the JARs present on the classpath. For example, if
 *       {@code spring-boot-starter-data-jpa} is detected, it auto-configures a DataSource,
 *       EntityManagerFactory, and TransactionManager.</li>
 *   <li>{@code @ComponentScan} — instructs Spring to scan the current package and all
 *       sub-packages for components annotated with {@code @Component}, {@code @Service},
 *       {@code @Repository}, {@code @Controller}, etc., and register them as beans.</li>
 * </ul>
 *
 * <p>Together these three annotations provide the bootstrap magic that eliminates the need for
 * large amounts of boilerplate XML or Java configuration that was required with earlier versions
 * of the Spring Framework.
 */
@SpringBootApplication
public class InventoryApplication {

    public static void main(String[] args) {
        SpringApplication.run(InventoryApplication.class, args);
    }
}
