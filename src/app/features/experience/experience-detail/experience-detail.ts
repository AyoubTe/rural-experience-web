import {Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ExperienceService} from '@rxp/features/experience/experience-service';
import {Experience} from '@rxp/core/models/experience.model';

@Component({
  selector: 'rxp-experience-detail',
  imports: [

  ],
  templateUrl: './experience-detail.html',
  styleUrl: './experience-detail.scss',
})
export class ExperienceDetail {
  private route   = inject(ActivatedRoute);

  // Data is available synchronously — no loading state needed
  experience = signal<Experience>(
    this.route.snapshot.data['experience']
  );

  // No ngOnInit, no HTTP call, no loading spinner
  // The resolver handled it all

  /* private router  = inject(Router);
  private expSvc  = inject(ExperienceService);

  experience = signal<Experience | null>(null);
  isLoading  = signal(true);
  error      = signal<string | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.expSvc.getById(id).subscribe({
      next: exp => {
        this.experience.set(exp);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        if (err.message.includes('not found')) {
          this.router.navigate(['/404']);
        } else {
          this.error.set(err.message);
          this.isLoading.set(false);
        }
      },
    });
  } */
}
