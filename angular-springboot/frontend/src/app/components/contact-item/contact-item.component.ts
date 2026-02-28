import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contact } from '../../models/contact.model';

/*
 * ContactItemComponent — renders a single contact card.
 * @Input() contact receives the Contact data from ContactListComponent.
 * @Output() deleted emits the contact's id when the delete button is clicked.
 * This pattern (smart parent, dumb child) keeps components reusable and testable.
 */
@Component({
  selector: 'app-contact-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-item.component.html',
})
export class ContactItemComponent {
  // Data flows DOWN from parent via @Input()
  @Input() contact!: Contact;

  // Events flow UP to parent via @Output()
  @Output() deleted = new EventEmitter<number>();

  onDelete(): void {
    if (this.contact.id !== undefined) {
      this.deleted.emit(this.contact.id);
    }
  }
}
