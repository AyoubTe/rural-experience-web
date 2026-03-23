import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef, MatDialogTitle
} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';

export interface ConfirmDialogData {
  title:       string;
  message:     string;
  confirmText: string;
  cancelText:  string;
  danger:      boolean;
}

@Component({
  selector: 'rxp-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogActions,
    MatDialogContent,
    MatIcon,
    MatDialogClose,
    MatButton,
    MatDialogTitle
  ],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialog {
  data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  // MatDialogRef used if we need to close programmatically
  dialogRef = inject(MatDialogRef<ConfirmDialog>);
}
