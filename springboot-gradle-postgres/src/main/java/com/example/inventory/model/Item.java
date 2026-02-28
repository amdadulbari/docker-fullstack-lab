package com.example.inventory.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * JPA entity representing a single inventory item stored in the {@code items} table.
 *
 * <p>Lombok annotations used:
 * <ul>
 *   <li>{@code @Data} — generates getters, setters, {@code equals()}, {@code hashCode()},
 *       and {@code toString()} at compile time.</li>
 *   <li>{@code @NoArgsConstructor} — generates a no-argument constructor required by JPA.</li>
 *   <li>{@code @AllArgsConstructor} — generates a constructor that accepts all fields,
 *       useful for testing and programmatic object creation.</li>
 * </ul>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "items")
public class Item {

    /**
     * Primary key. The {@code IDENTITY} strategy delegates ID generation to the database
     * (i.e., a PostgreSQL {@code SERIAL} / {@code BIGSERIAL} column).
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Human-readable name of the inventory item. Must not be blank and cannot exceed 200
     * characters.
     */
    @NotBlank(message = "Item name must not be blank")
    @Size(max = 200, message = "Item name must not exceed 200 characters")
    @Column(nullable = false)
    private String name;

    /**
     * Optional longer description of the item. Stored as TEXT in PostgreSQL by default.
     */
    private String description;

    /**
     * Unit price of the item. Must be zero or a positive value with up to 10 digits total
     * and 2 decimal places.
     */
    @DecimalMin(value = "0.0", message = "Price must be zero or positive")
    @Column(precision = 10, scale = 2)
    private BigDecimal price;

    /**
     * Number of units currently in stock. Defaults to 0 and must not be negative.
     */
    @Min(value = 0, message = "Quantity must be zero or positive")
    @Column(columnDefinition = "integer default 0")
    private Integer quantity = 0;

    /**
     * Identifier of the warehouse where this item is stored. Optional.
     */
    @Column(length = 100)
    private String warehouse;

    /**
     * Whether this item is currently available for ordering. Defaults to {@code true}.
     */
    @Column(columnDefinition = "boolean default true")
    private boolean available = true;

    /**
     * Timestamp set automatically when the record is first inserted. Never updated thereafter
     * (enforced by {@code updatable = false}).
     */
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    /**
     * Timestamp automatically updated by Hibernate every time the entity is modified.
     */
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
