package com.example.contacts.service;

import com.example.contacts.exception.ResourceNotFoundException;
import com.example.contacts.model.Contact;
import com.example.contacts.repository.ContactRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ContactService {

    private final ContactRepository contactRepository;

    @Transactional(readOnly = true)
    public List<Contact> findAll() {
        log.debug("Fetching all contacts");
        return contactRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Contact findById(Long id) {
        log.debug("Fetching contact with id: {}", id);
        return contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found with id: " + id));
    }

    public Contact create(Contact contact) {
        log.debug("Creating new contact with email: {}", contact.getEmail());
        return contactRepository.save(contact);
    }

    public Contact update(Long id, Contact contactDetails) {
        log.debug("Updating contact with id: {}", id);
        Contact existing = findById(id);

        existing.setName(contactDetails.getName());
        existing.setEmail(contactDetails.getEmail());
        existing.setPhone(contactDetails.getPhone());
        existing.setCompany(contactDetails.getCompany());
        existing.setActive(contactDetails.isActive());

        return contactRepository.save(existing);
    }

    public void delete(Long id) {
        log.debug("Deleting contact with id: {}", id);
        Contact existing = findById(id);
        contactRepository.delete(existing);
    }

    @Transactional(readOnly = true)
    public List<Contact> findByCompany(String company) {
        log.debug("Fetching contacts for company: {}", company);
        return contactRepository.findByCompany(company);
    }
}
