import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {NotificationService} from '@rxp/features/notification/notification-service';
import {ExperienceService} from '@rxp/features/experience/experience-service';
import {MatSlideToggle, MatSlideToggleChange} from '@angular/material/slide-toggle';
import {ExperienceSummaryResponse} from '@rxp/core/models/responses.model';
import {ConfirmDialog} from '@rxp/shared/components/confirm-dialog/confirm-dialog';
import {MatIcon} from '@angular/material/icon';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatCard, MatCardActions, MatCardContent, MatCardImage} from '@angular/material/card';
import {CurrencyPipe, DecimalPipe} from '@angular/common';
import {DurationPipe} from '@rxp/shared/pipes/duration/duration-pipe';
import {MatTooltip} from '@angular/material/tooltip';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {RouterLink} from '@angular/router';
import {MatDivider} from '@angular/material/list';
import {MatChip} from '@angular/material/chips';
import {MatButton, MatIconButton} from '@angular/material/button';

@Component({
  selector: 'rxp-host-experiences',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIcon,
    MatProgressBar,
    MatCard,
    MatCardContent,
    CurrencyPipe,
    DurationPipe,
    DecimalPipe,
    MatCardActions,
    MatSlideToggle,
    MatTooltip,
    MatMenuTrigger,
    MatMenu,
    RouterLink,
    MatDivider,
    MatChip,
    MatButton,
    MatMenuItem,
    MatCardImage,
    MatIconButton
  ],
  templateUrl: './host-experiences.html',
  styleUrl: './host-experiences.scss',
})
export class HostExperiences implements OnInit {
  private svc    = inject(ExperienceService);
  private dialog = inject(MatDialog);
  private notify = inject(NotificationService);

  awaitingModerationTooltip = $localize`:@@hostExperiences.tooltipAwaiting:Awaiting moderation approval`;
  publishTooltip = $localize`:@@hostExperiences.tooltipPublish:Publish`;
  unpublishTooltip = $localize`:@@hostExperiences.tooltipUnpublish:Unpublish`;

  experiences  = signal<ExperienceSummaryResponse[]>([]);
  isLoading    = signal(true);
  togglingId   = signal<number | null>(null); // Which toggle is in flight

  ngOnInit(): void {
    this.loadExperiences();
  }

  private loadExperiences(): void {
    this.isLoading.set(true);
    this.svc.getHostExperiences().subscribe({
      next:  exps => { this.experiences.set(exps.content); this.isLoading.set(false); },
      error: err  => { this.notify.error(err.message); this.isLoading.set(false); },
    });
  }

  // ── Publish / unpublish inline toggle ─────────────────────────
  onTogglePublish(exp: ExperienceSummaryResponse, event: MatSlideToggleChange): void {
    const newStatus =
      event.checked ? 'PUBLISHED' : 'DRAFT';

    this.togglingId.set(exp.id);

    this.svc.updateStatus(exp.id, newStatus).subscribe({
      next: updated => {
        this.experiences.update(list =>
          list.map(e => e.id === updated.id ? updated : e)
        );
        this.togglingId.set(null);
        this.notify.success(
          newStatus === 'PUBLISHED'
            ? `"${exp.title}" is now live!`
            : `"${exp.title}" moved to drafts.`
        );
      },
      error: err => {
        // Revert the toggle visually
        event.source.checked = !event.checked;
        this.togglingId.set(null);
        this.notify.error(err.message);
      },
    });
  }

  // ── Delete experience ──────────────────────────────────────────
  onDelete(exp: ExperienceSummaryResponse): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title:       'Delete Experience',
        message:     `Delete "${exp.title}"? ` +
          `This cannot be undone and will cancel ` +
          `any pending bookings.`,
        confirmText: 'Delete',
        cancelText:  'Keep',
        danger:      true,
      },
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.svc.deleteExperience(exp.id).subscribe({
        next: () => {
          this.experiences.update(list =>
            list.filter(e => e.id !== exp.id)
          );
          this.notify.success(`"${exp.title}" deleted.`);
        },
        error: err => this.notify.error(err.message),
      });
    });
  }
}
