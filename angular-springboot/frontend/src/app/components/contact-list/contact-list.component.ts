import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contact } from '../../models/contact.model';
import { ContactItemComponent } from '../contact-item/contact-item.component';

/*
 * ContactListComponent — displays the list of all contacts.
 * Uses @Input() to receive contacts from the parent (AppComponent).
 * Uses @Output() to bubble up delete events to the parent.
 * *ngFor iterates over the contacts array and renders a ContactItemComponent for each.
 */
@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, ContactItemComponent],
  templateUrl: './contact-list.component.html',
})
export class ContactListComponent {
  // @Input() receives data flowing DOWN from parent to child
  @Input() contacts: Contact[] = [];

  // @Output() sends events flowing UP from child to parent
  @Output() contactDeleted = new EventEmitter<number>();

  onDelete(id: number): void {
    this.contactDeleted.emit(id);
  }

  // trackBy improves *ngFor performance by tracking items by their unique id
  trackById(_index: number, contact: Contact): number | undefined {
    return contact.id;
  }
}
