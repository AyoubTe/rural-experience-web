import {
  Component, OnInit, ChangeDetectionStrategy, inject, signal
} from '@angular/core';

import { Router } from '@angular/router';

import { ExperienceCardComponent }
  from '@rxp/shared/components/experience-card/experience-card';

import { Experience }
  from '@rxp/core/models/experience.model';

import { MOCK_EXPERIENCES }
  from '@rxp/core/mocks/experience.mock';

@Component({
  selector: 'rxp-experience-list',
  standalone: true,
  templateUrl: './experience-list.html',
  styleUrl: './experience-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ExperienceCardComponent],
})
export class ExperienceListComponent implements OnInit {

  private router = inject(Router);

  // Signal-based state (replaces plain array property)
  experiences = signal<Experience[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    // Simulate an async data load (replaced by HTTP in Chapter 5)
    setTimeout(() => {
      this.experiences.set(MOCK_EXPERIENCES);
      this.isLoading.set(false);
    }, 600);
  }

  onExperienceBooked(experienceId: number): void {
    this.router.navigate(['/experiences', experienceId, 'book']);
  }
}
