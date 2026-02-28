import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Contact } from '../../models/contact.model';

/*
 * ContactFormComponent — handles new contact creation.
 * FormsModule enables template-driven forms with [(ngModel)] two-way binding.
 * @Output() contactAdded emits the new contact data up to AppComponent.
 * The form uses ngModel to bind input values to the model object.
 */
@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-form.component.html',
})
export class ContactFormComponent {
  // @Output() EventEmitter sends the new contact data to the parent component
  @Output() contactAdded = new EventEmitter<Partial<Contact>>();

  // Model object bound to form fields via [(ngModel)]
  model: Partial<Contact> = {
    name: '',
    email: '',
    phone: '',
    company: '',
    active: true,
  };

  isSubmitting = false;

  onSubmit(form: NgForm): void {
    if (form.invalid) return;

    this.isSubmitting = true;

    // Emit the contact data to parent (AppComponent)
    this.contactAdded.emit({ ...this.model });

    // Reset the form to its initial state
    form.resetForm();
    this.model = { name: '', email: '', phone: '', company: '', active: true };
    this.isSubmitting = false;
  }
}
