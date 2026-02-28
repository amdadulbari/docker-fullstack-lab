package com.example.inventory.repository;

import com.example.inventory.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for {@link Item} entities.
 *
 * <p>By extending {@link JpaRepository}, this interface automatically inherits a full set of
 * CRUD operations ({@code save}, {@code findById}, {@code findAll}, {@code deleteById}, etc.)
 * without requiring any implementation class. Spring Data generates a proxy implementation at
 * application startup.
 *
 * <p>The additional query methods below are auto-implemented by Spring Data JPA through its
 * <em>derived query</em> mechanism: it parses the method name according to a set of naming
 * conventions and generates the corresponding JPQL (or SQL) query automatically. For example:
 * <ul>
 *   <li>{@code findBy<Field>} translates to {@code WHERE <field> = ?1}.</li>
 *   <li>{@code findBy<Field>ContainingIgnoreCase} translates to
 *       {@code WHERE LOWER(<field>) LIKE LOWER('%' || ?1 || '%')}.</li>
 * </ul>
 *
 * <p>No {@code @Query} annotations or SQL strings are needed for these common patterns,
 * which dramatically reduces boilerplate code.
 */
@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    /**
     * Returns all items located in the specified warehouse.
     *
     * <p>Derived query equivalent: {@code SELECT i FROM Item i WHERE i.warehouse = :warehouse}
     *
     * @param warehouse the warehouse identifier to filter on
     * @return list of matching items, possibly empty
     */
    List<Item> findByWarehouse(String warehouse);

    /**
     * Returns all items whose {@code available} flag matches the given value.
     *
     * <p>Derived query equivalent: {@code SELECT i FROM Item i WHERE i.available = :available}
     *
     * @param available {@code true} to retrieve available items, {@code false} for unavailable
     * @return list of matching items, possibly empty
     */
    List<Item> findByAvailable(boolean available);

    /**
     * Returns all items whose name contains the given substring, case-insensitively.
     *
     * <p>Derived query equivalent:
     * {@code SELECT i FROM Item i WHERE LOWER(i.name) LIKE LOWER('%' || :name || '%')}
     *
     * @param name the substring to search for within the item name
     * @return list of matching items, possibly empty
     */
    List<Item> findByNameContainingIgnoreCase(String name);
}
