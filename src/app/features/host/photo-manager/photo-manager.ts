import {ChangeDetectionStrategy, Component, inject, input, signal} from '@angular/core';
import {NotificationService} from '@rxp/features/notification/notification-service';
import {ExperiencePhoto} from '@rxp/core/models/experience.model';

import {
  CdkDragDrop, CdkDropList,
  CdkDrag, CdkDragHandle,
  moveItemInArray, CdkDragPreview, CdkDragPlaceholder
} from '@angular/cdk/drag-drop';
import {MatIcon} from '@angular/material/icon';
import {MatProgressBar} from '@angular/material/progress-bar';
import {PhotoService} from '@rxp/features/photo/photo-service';
import {PhotoResponse} from '@rxp/core/models/responses.model';

@Component({
  selector: 'rxp-photo-manager',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CdkDropList,
    CdkDrag,
    MatIcon,
    MatProgressBar,
    CdkDragPreview,
    CdkDragPlaceholder
  ],
  templateUrl: './photo-manager.html',
  styleUrl: './photo-manager.scss',
})
export class PhotoManager {
  // ── Inputs ──────────────────────────────────────────────────────
  experienceId = input.required<number>();

  // ── Services ────────────────────────────────────────────────────
  private photoSvc = inject(PhotoService);
  private notify   = inject(NotificationService);

  // ── State ────────────────────────────────────────────────────────
  photos      = signal<PhotoResponse[]>([]);
  isUploading = signal(false);

  ngOnInit(): void {
    // Load existing photos for this experience
    this.photoSvc.getPhotos(this.experienceId())
      .subscribe(serverPhotos => {
        this.photos.set(serverPhotos.map(p => ({
          id:             p.id,
          url:            p.url,
          filename:       p.altText,
          sortOrder:      p.sortOrder,
          uploadedAt:     p.uploadedAt,
        })));
      });
  }

  // ── File selection ────────────────────────────────────────────
  onFileSelected(event: Event): void {
    const input   = event.target as HTMLInputElement;
    const files   = Array.from(input.files ?? []);
    input.value   = ''; // Reset so same file can be re-selected

    const validFiles = files.filter(f => {
      if (!f.type.startsWith('image/')) {
        this.notify.error(`${f.name} is not an image.`);
        return false;
      }
      if (f.size > 10 * 1024 * 1024) { // 10 MB limit
        this.notify.error(`${f.name} exceeds the 10 MB limit.`);
        return false;
      }
      return true;
    });

    validFiles.forEach(file => this.uploadPhoto(file));
  }

  // ── Upload ────────────────────────────────────────────────────
  private uploadPhoto(file: File): void {
    const previewUrl = URL.createObjectURL(file);

    // Add a pending entry immediately for instant visual feedback
    const pending: PhotoResponse = {
      id:             0,
      url:            previewUrl,
      altText:       file.name,
      uploadedAt:       'now',
      sortOrder: 0,
    };

    this.photos.update(list => [...list, pending]);
    this.isUploading.set(true);

    this.photoSvc
      .uploadPhoto(this.experienceId(), file)
      .subscribe({
        next: event => {
          if (event.type === 'progress') {
            // Update progress for this specific file
            this.photos.update(list =>
              list.map(p =>
                p.url === previewUrl
                  ? { ...p, uploadProgress: event.progress }
                  : p
              )
            );
          } else if (event.type === 'complete') {
            // Replace pending entry with server response
            URL.revokeObjectURL(previewUrl);
            this.photos.update(list =>
              list.map(p =>
                p.url === previewUrl
                  ? {
                    id:             event.photo.id,
                    url:            event.photo.url,
                    altText:       event.photo.altText,
                    uploadedAt:       'true',
                    sortOrder: 1,
                  }
                  : p
              )
            );
            this.isUploading.set(false);
          }
        },
        error: err => {
          this.photos.update(list =>
            list.filter(p => p.url !== previewUrl)
          );
          URL.revokeObjectURL(previewUrl);
          this.isUploading.set(false);
          this.notify.error(`Upload failed: ${err.message}`);
        },
      });
  }

  // ── Drag-and-drop reorder ─────────────────────────────────────
  onDrop(event: CdkDragDrop<PhotoResponse[]>): void {
    // moveItemInArray mutates in place — wrap in update()
    this.photos.update(list => {
      const copy = [...list];
      moveItemInArray(copy, event.previousIndex, event.currentIndex);
      return copy;
    });

    // Persist the new order to the server
    const orderedIds = this.photos()
      .filter(p => p.id !== null)
      .map(p => p.id!);

    this.photoSvc
      .reorderPhotos(this.experienceId(), orderedIds)
      .subscribe({
        error: err => this.notify.error(`Reorder failed: ${err.message}`)
      });
  }

  // ── Delete photo ──────────────────────────────────────────────
  onDeletePhoto(photo: PhotoResponse): void {
    if (!photo.id) return; // Not yet uploaded

    this.photoSvc.deletePhoto(this.experienceId(), photo.id)
      .subscribe({
        next: () => {
          this.photos.update(list =>
            list.filter(p => p.id !== photo.id)
          );
          this.notify.success('Photo deleted.');
        },
        error: err => this.notify.error(err.message),
      });
  }

  // Cover photo = first photo in the list
  get coverPhotoIndex(): number { return 0; }
}
