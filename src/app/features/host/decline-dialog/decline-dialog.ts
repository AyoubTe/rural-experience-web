import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef, MatDialogTitle
} from '@angular/material/dialog';
import {MatFormField, MatHint, MatInput, MatLabel} from '@angular/material/input';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'rxp-decline-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIcon,
    MatDialogContent,
    MatFormField,
    MatLabel,
    ReactiveFormsModule,
    MatHint,
    MatDialogActions,
    MatDialogClose,
    MatButton,
    MatInput,
    MatDialogTitle
  ],
  templateUrl: './decline-dialog.html',
  styleUrl: './decline-dialog.scss',
})
export class DeclineDialog {
  data      = inject<{ bookingId: number }>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<DeclineDialog>);

  reasonCtrl = new FormControl<string>('', { nonNullable: true });

  onDecline(): void {
    const reason = this.reasonCtrl.value.trim();
    // Close with the reason string (or null if empty)
    this.dialogRef.close(reason || null);
  }
}
