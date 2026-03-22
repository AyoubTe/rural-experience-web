import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatFormFieldModule }  from '@angular/material/form-field';
import { MatInputModule }      from '@angular/material/input';
import { MatButtonModule }     from '@angular/material/button';

@Component({
  selector: 'rxp-contact-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule, MatFormFieldModule,
    MatInputModule, MatButtonModule
  ],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.scss',
})
export class ContactForm {
  model = { name: '', email: '', message: '' };
  sent  = signal(false);

  onSubmit(form: NgForm): void {
    if (form.invalid) return;
    // Submit model to API...
    this.sent.set(true);
    form.resetForm();
  }
}
