package com.example.employees.repository;

import com.example.employees.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for Employee.
 * JpaRepository provides CRUD methods out of the box:
 *   - findAll(), findById(), save(), deleteById(), count(), etc.
 * Method names are parsed by Spring to generate SQL queries automatically.
 */
@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    // Spring generates: SELECT * FROM employees WHERE department = ?
    List<Employee> findByDepartment(String department);

    // Spring generates: SELECT * FROM employees WHERE email = ?
    Optional<Employee> findByEmail(String email);

    // Spring generates: SELECT * FROM employees WHERE active = ?
    List<Employee> findByActive(boolean active);
}
