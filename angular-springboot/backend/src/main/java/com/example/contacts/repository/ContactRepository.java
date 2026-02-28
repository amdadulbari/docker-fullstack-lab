package com.example.contacts.repository;

import com.example.contacts.model.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {

    List<Contact> findByCompany(String company);

    List<Contact> findByActiveTrue();

    boolean existsByEmail(String email);
}
