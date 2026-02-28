package com.example.employees.controller;

import com.example.employees.model.Employee;
import com.example.employees.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * REST Controller for Employee CRUD operations.
 * @RestController = @Controller + @ResponseBody (auto-serializes return values to JSON)
 * @RequestMapping sets the base URL for all endpoints in this controller.
 */
@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    // GET /api/v1/employees?department=Engineering
    @GetMapping
    public ResponseEntity<List<Employee>> listEmployees(
            @RequestParam(required = false) String department) {
        List<Employee> employees = (department != null)
                ? employeeService.findByDepartment(department)
                : employeeService.findAll();
        return ResponseEntity.ok(employees);
    }

    // POST /api/v1/employees
    @PostMapping
    public ResponseEntity<Employee> createEmployee(@Valid @RequestBody Employee employee) {
        Employee created = employeeService.create(employee);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // GET /api/v1/employees/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployee(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.findById(id));
    }

    // PUT /api/v1/employees/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Employee> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody Employee employee) {
        return ResponseEntity.ok(employeeService.update(id, employee));
    }

    // DELETE /api/v1/employees/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        employeeService.delete(id);
        return ResponseEntity.noContent().build();  // 204 No Content
    }
}
