import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contact } from './models/contact.model';
import { ContactService } from './services/contact.service';
import { ContactListComponent } from './components/contact-list/contact-list.component';
import { ContactFormComponent } from './components/contact-form/contact-form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ContactListComponent, ContactFormComponent],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  contacts: Contact[] = [];
  loading = true;
  error = '';

  constructor(private contactService: ContactService) {}

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    this.loading = true;
    this.error = '';
    this.contactService.getAll().subscribe({
      next: (data) => { this.contacts = data; this.loading = false; },
      error: () => { this.error = 'Failed to load contacts'; this.loading = false; }
    });
  }

  onAdd(contact: Partial<Contact>): void {
    this.contactService.create(contact).subscribe({
      next: () => this.loadContacts(),
      error: () => { this.error = 'Failed to create contact'; }
    });
  }

  onDelete(id: number): void {
    this.contactService.delete(id).subscribe({
      next: () => this.loadContacts(),
      error: () => { this.error = 'Failed to delete contact'; }
    });
  }
}
