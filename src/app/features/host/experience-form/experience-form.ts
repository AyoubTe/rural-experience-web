import {ChangeDetectionStrategy, Component, inject, signal,} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {MatStepperModule} from '@angular/material/stepper';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatChipsModule} from '@angular/material/chips';
import {STEPPER_GLOBAL_OPTIONS} from '@angular/cdk/stepper';
import {HasUnsavedChanges} from '@rxp/core/auth/unsaved-changes-guard/unsaved-changes-guard';
import {monetaryAmountValidator, positiveIntegerValidator,} from '@rxp/shared/validators/date.validators';
import {CategoryService} from '@rxp/features/category/category-service';
import {AsyncPipe} from '@angular/common';
import {combineLatest, map} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';
import {ExperienceService} from '@rxp/features/experience/experience-service';
import {CdkDragDrop, DragDropModule, moveItemInArray} from '@angular/cdk/drag-drop';

@Component({
  selector: 'rxp-experience-form',
  standalone: true,
  templateUrl: './experience-form.html',
  styleUrl: './experience-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatStepperModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule,
    MatChipsModule, AsyncPipe,
    DragDropModule,
  ],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS,
    useValue: {showError: true},  // Show error indicators on steps
  }],
})
export class ExperienceForm implements HasUnsavedChanges {

  private fb = inject(FormBuilder);
  private svc = inject(ExperienceService);
  private router = inject(Router);
  private catSvc = inject(CategoryService);

  isSubmitting = signal(false);
  submitError = signal<string | null>(null);

  categories$ = this.catSvc.categories$;

  selectedFiles = signal<File[]>([]);
  imagePreviews: { url: string }[] = [];

  // ── Step 1: Basic info ─────────────────────────────────────────
  basicInfoForm: FormGroup = this.fb.group({
    title: [
      '',
      [Validators.required, Validators.minLength(10),
        Validators.maxLength(100)],
    ],
    description: [
      '',
      [Validators.required, Validators.minLength(50),
        Validators.maxLength(2000)],
    ],
    categoryId: [null, Validators.required],
  });

  // ── Step 2: Logistics ──────────────────────────────────────────
  logisticsForm: FormGroup = this.fb.group({
    pricePerPerson: [
      null,
      [Validators.required, Validators.min(10),
        monetaryAmountValidator()],
    ],
    durationDays: [
      1,
      [Validators.required, Validators.min(1), Validators.max(30),
        positiveIntegerValidator()],
    ],
    maxGuests: [
      4,
      [Validators.required, Validators.min(1), Validators.max(50),
        positiveIntegerValidator()],
    ],
    location: ['', Validators.required],
    country: ['France', Validators.required],
  });

  // ── Step 3: Daily agenda (dynamic FormArray) ───────────────────
  agendaForm: FormGroup = this.fb.group({
    agendaItems: this.fb.array([
      this.createAgendaItem('Morning', 'Arrival and welcome'),
      this.createAgendaItem('Afternoon', 'Core activity'),
    ]),
  });

  get agendaItems(): FormArray {
    return this.agendaForm.get('agendaItems') as FormArray;
  }

  createAgendaItem(
    time = '', activity = ''
  ): FormGroup {
    return this.fb.group({
      time: [time, Validators.required],
      activity: [activity, [Validators.required,
        Validators.maxLength(200)]],
    });
  }

  addAgendaItem(): void {
    this.agendaItems.push(this.createAgendaItem());
  }

  removeAgendaItem(index: number): void {
    if (this.agendaItems.length > 1) {
      this.agendaItems.removeAt(index);
    }
  }

  // ── Derived ────────────────────────────────────────────────────
  allFormsValid = toSignal(
    combineLatest([
      this.basicInfoForm.statusChanges,
      this.logisticsForm.statusChanges,
      this.agendaForm.statusChanges,
    ]).pipe(
      map(() =>
        this.basicInfoForm.valid &&
        this.logisticsForm.valid &&
        this.agendaForm.valid
      )
    ),
    {initialValue: false}
  );

  // ── HasUnsavedChanges interface (for canDeactivate guard) ──────
  hasUnsavedChanges(): boolean {
    return (
      this.basicInfoForm.dirty ||
      this.logisticsForm.dirty ||
      this.agendaForm.dirty
    ) && !this.isSubmitting();
  }

  // ── Handle Images Upload ──────
  onFileSelected(event: any) {
    const files = event.target.files;
    this.handleFiles(files);
  }

  handleFiles(files: FileList) {
    for (const element of files) {
      const file = element;
      this.selectedFiles.update(files => [...files, file]);

      // Create a local URL for the preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviews.push({url: e.target.result});
      };
      reader.readAsDataURL(file);
    }
  }

  removeFile(index: number) {
    this.selectedFiles.update(files => {
      const newFiles = [...files];
      newFiles.splice(index, 1);
      return newFiles;
    });
    this.imagePreviews.splice(index, 1);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onFileDropped(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(files);
    }
  }

  reorderFiles(event: CdkDragDrop<string[]>) {
    this.selectedFiles.update(files => {
      const newFiles = [...files];
      moveItemInArray(newFiles, event.previousIndex, event.currentIndex);
      return newFiles;
    });
    moveItemInArray(this.imagePreviews, event.previousIndex, event.currentIndex);
  }

  // ── Submission ─────────────────────────────────────────────────
  onSubmit(): void {
    if (!this.allFormsValid() || this.selectedFiles.length === 0) {
      this.basicInfoForm.markAllAsTouched();
      this.logisticsForm.markAllAsTouched();
      this.agendaForm.markAllAsTouched();
      if (this.selectedFiles.length === 0) {
        this.submitError.set("Please upload at least one photo.");
      }
      return;
    }

    // Prepare FormData
    const formData = new FormData();

    this.isSubmitting.set(true);
    this.submitError.set(null);

    const payload = {
      ...this.basicInfoForm.value,
      ...this.logisticsForm.value,
      agendaItems: this.agendaItems.value,
    };

    formData.append('experience', new Blob([JSON.stringify(payload)], {
      type: 'application/json'
    }));

    this.selectedFiles().forEach((file: File) => {
      formData.append('files', file);
    });

    this.svc.createExperience(formData).subscribe({
      next: created => {
        this.resetForms();
        this.router.navigate(['/host/experiences', created.id]);
      },
      error: (err: Error) => {
        this.submitError.set(err.message);
        this.isSubmitting.set(false);
      },
    });
  }

  private resetForms() {
    this.basicInfoForm.markAsPristine();
    this.logisticsForm.markAsPristine();
    this.agendaForm.markAsPristine();
  }
}
