package com.example.inventory.controller;

import com.example.inventory.model.Item;
import com.example.inventory.service.ItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller exposing CRUD endpoints for inventory items under {@code /api/v1/items}.
 *
 * <p>{@code @RestController} is a composed annotation that combines {@code @Controller}
 * and {@code @ResponseBody}, meaning every method return value is written directly to the
 * HTTP response body as JSON (via Jackson).
 *
 * <p>{@code @RequestMapping("/api/v1/items")} establishes the base path for all endpoints
 * in this controller, following the versioned API convention {@code /api/v{version}/...}.
 */
@RestController
@RequestMapping("/api/v1/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    /**
     * Lists all inventory items, optionally filtered by warehouse.
     *
     * <p>When the {@code warehouse} query parameter is provided, only items located in that
     * warehouse are returned. Otherwise all items are returned.
     *
     * <p>Example: {@code GET /api/v1/items?warehouse=WAREHOUSE_A}
     *
     * @param warehouse optional warehouse filter
     * @return 200 OK with a list of items (may be empty)
     */
    @GetMapping
    public ResponseEntity<List<Item>> listItems(
            @RequestParam(required = false) String warehouse) {

        List<Item> items = (warehouse != null && !warehouse.isBlank())
                ? itemService.findByWarehouse(warehouse)
                : itemService.findAll();

        return ResponseEntity.ok(items);
    }

    /**
     * Creates a new inventory item.
     *
     * <p>{@code @Valid} triggers Bean Validation on the request body. If any constraint is
     * violated, Spring automatically returns a {@code 400 Bad Request} response before this
     * method is invoked (handled by {@code GlobalExceptionHandler}).
     *
     * @param item the item data from the request body
     * @return 201 Created with the persisted item (including generated ID and timestamps)
     */
    @PostMapping
    public ResponseEntity<Item> createItem(@Valid @RequestBody Item item) {
        Item created = itemService.create(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Retrieves a single item by its ID.
     *
     * @param id the item primary key
     * @return 200 OK with the item, or 404 if not found
     */
    @GetMapping("/{id}")
    public ResponseEntity<Item> getItem(@PathVariable Long id) {
        return ResponseEntity.ok(itemService.findById(id));
    }

    /**
     * Fully replaces an existing item's data.
     *
     * <p>All mutable fields are overwritten with values from the request body. Audit timestamps
     * ({@code createdAt}, {@code updatedAt}) are managed by Hibernate and are not affected by
     * the incoming payload.
     *
     * @param id   the ID of the item to update
     * @param item the replacement data from the request body
     * @return 200 OK with the updated item, or 404 if not found
     */
    @PutMapping("/{id}")
    public ResponseEntity<Item> updateItem(
            @PathVariable Long id,
            @Valid @RequestBody Item item) {

        return ResponseEntity.ok(itemService.update(id, item));
    }

    /**
     * Deletes an inventory item by its ID.
     *
     * @param id the ID of the item to delete
     * @return 204 No Content on success, or 404 if not found
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        itemService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
