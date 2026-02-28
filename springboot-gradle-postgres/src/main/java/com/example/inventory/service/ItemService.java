package com.example.inventory.service;

import com.example.inventory.exception.ResourceNotFoundException;
import com.example.inventory.model.Item;
import com.example.inventory.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Business logic layer for inventory item operations.
 *
 * <p>{@code @Service} is a specialisation of {@code @Component} that semantically marks this
 * class as belonging to the service layer. It also enables exception translation so that
 * persistence exceptions are converted to Spring's {@code DataAccessException} hierarchy.
 *
 * <p>{@code @RequiredArgsConstructor} (Lombok) generates a constructor for all
 * {@code final} fields, which Spring uses for constructor-based dependency injection —
 * the recommended approach over field injection because it makes dependencies explicit and
 * the class easier to unit-test.
 */
@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;

    /**
     * Retrieves every item from the database.
     *
     * @return all items, possibly an empty list
     */
    @Transactional(readOnly = true)
    public List<Item> findAll() {
        return itemRepository.findAll();
    }

    /**
     * Retrieves a single item by its primary key.
     *
     * @param id the item ID
     * @return the found item
     * @throws ResourceNotFoundException if no item exists with the given ID
     */
    @Transactional(readOnly = true)
    public Item findById(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Item not found with id: " + id));
    }

    /**
     * Retrieves all items stored in a specific warehouse.
     *
     * @param warehouse the warehouse identifier
     * @return items in the specified warehouse, possibly an empty list
     */
    @Transactional(readOnly = true)
    public List<Item> findByWarehouse(String warehouse) {
        return itemRepository.findByWarehouse(warehouse);
    }

    /**
     * Persists a new inventory item to the database.
     *
     * @param item the item to create; the {@code id}, {@code createdAt}, and {@code updatedAt}
     *             fields are managed by the persistence layer and should not be set by callers
     * @return the saved item with its generated ID and audit timestamps populated
     */
    @Transactional
    public Item create(Item item) {
        return itemRepository.save(item);
    }

    /**
     * Updates every mutable field of an existing item.
     *
     * <p>The entity is first loaded (throwing {@link ResourceNotFoundException} if absent) so
     * that Hibernate can track it and issue a targeted {@code UPDATE} statement on flush.
     *
     * @param id      the ID of the item to update
     * @param updated an {@link Item} carrying the new field values; its {@code id} is ignored
     * @return the updated and re-saved item
     * @throws ResourceNotFoundException if no item exists with the given ID
     */
    @Transactional
    public Item update(Long id, Item updated) {
        Item existing = findById(id);

        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setPrice(updated.getPrice());
        existing.setQuantity(updated.getQuantity());
        existing.setWarehouse(updated.getWarehouse());
        existing.setAvailable(updated.isAvailable());

        return itemRepository.save(existing);
    }

    /**
     * Deletes an item by ID.
     *
     * <p>The item is loaded first so that a {@link ResourceNotFoundException} is raised when the
     * ID does not exist, rather than silently succeeding.
     *
     * @param id the ID of the item to delete
     * @throws ResourceNotFoundException if no item exists with the given ID
     */
    @Transactional
    public void delete(Long id) {
        Item existing = findById(id);
        itemRepository.delete(existing);
    }
}
