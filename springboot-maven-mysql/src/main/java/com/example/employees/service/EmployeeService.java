package com.example.employees.service;

import com.example.employees.exception.ResourceNotFoundException;
import com.example.employees.model.Employee;
import com.example.employees.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * Service layer contains business logic.
 * Controllers delegate to services; services use repositories for data access.
 * This separation keeps each layer focused on one responsibility.
 */
@Service
@RequiredArgsConstructor  // Lombok: generates constructor for all final fields (used for DI)
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    public List<Employee> findAll() {
        return employeeRepository.findAll();
    }

    public List<Employee> findByDepartment(String department) {
        return employeeRepository.findByDepartment(department);
    }

    public Employee findById(Long id) {
        // orElseThrow: if not found, throw ResourceNotFoundException (handled by GlobalExceptionHandler)
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
    }

    public Employee create(Employee employee) {
        return employeeRepository.save(employee);
    }

    public Employee update(Long id, Employee updatedEmployee) {
        Employee existing = findById(id);
        existing.setName(updatedEmployee.getName());
        existing.setEmail(updatedEmployee.getEmail());
        existing.setDepartment(updatedEmployee.getDepartment());
        existing.setPosition(updatedEmployee.getPosition());
        existing.setSalary(updatedEmployee.getSalary());
        existing.setActive(updatedEmployee.isActive());
        return employeeRepository.save(existing);
    }

    public void delete(Long id) {
        Employee employee = findById(id);
        employeeRepository.delete(employee);
    }
}
