import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {AdminService} from '@rxp/features/admin/admin-service';
import {PlatformStats} from '@rxp/core/models/admin.model';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatCard, MatCardActions, MatCardContent} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {CurrencyPipe, DecimalPipe, PercentPipe} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'rxp-admin-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatProgressBar,
    MatCard,
    MatCardContent,
    MatIcon,
    DecimalPipe,
    MatCardActions,
    MatButton,
    RouterLink,
    CurrencyPipe,
    PercentPipe
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard implements OnInit {
  private adminSvc = inject(AdminService);

  stats     = signal<PlatformStats | null>(null);
  isLoading = signal(true);
  error     = signal<string | null>(null);

  ngOnInit(): void {
    this.adminSvc.getStats().subscribe({
      next:  s => { this.stats.set(s); this.isLoading.set(false); },
      error: e => { this.error.set(e.message); this.isLoading.set(false); },
    });
  }
}
