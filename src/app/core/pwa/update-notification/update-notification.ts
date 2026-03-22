import {
  Component, ChangeDetectionStrategy,
  inject, signal
} from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter } from 'rxjs/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'rxp-update-notification',
  standalone: true,
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateNotification {

  private updates  = inject(SwUpdate);
  private snackBar = inject(MatSnackBar);

  constructor() {
    if (!this.updates.isEnabled) return;

    // Listen for a new version being ready
    this.updates.versionUpdates.pipe(
      filter((e): e is VersionReadyEvent =>
        e.type === 'VERSION_READY'
      ),
      takeUntilDestroyed(),
    ).subscribe(() => {
      const ref = this.snackBar.open(
        'A new version of RuralXperience is available.',
        'Update Now',
        { duration: 0 }  // Does not auto-dismiss
      );

      ref.onAction().subscribe(() => {
        // Reload to activate the new version
        document.location.reload();
      });
    });
  }
}
