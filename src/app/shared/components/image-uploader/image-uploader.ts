import {Component, computed, input, output, signal} from '@angular/core';
import {ImagePreview} from '@rxp/core/models/api.model';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {CdkDragDrop, CdkDragHandle, DragDropModule, moveItemInArray} from '@angular/cdk/drag-drop';

@Component({
  selector: 'rxp-image-uploader',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    DragDropModule,
    CdkDragHandle
  ],
  templateUrl: './image-uploader.html',
  styleUrl: './image-uploader.scss',
})
export class ImageUploader {
  // Inputs & Outputs version Signal
  maxFiles = input<number>(10);
  filesChanged = output<File[]>();

  // État géré par un Signal
  previews = signal<ImagePreview[]>([]);

  // Computed pour savoir si on a atteint la limite
  isFull = computed(() => this.previews().length >= this.maxFiles());

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(input.files);
    }
  }

  onFileDropped(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  private handleFiles(fileList: FileList) {
    const currentCount = this.previews().length;
    const remainingSlots = this.maxFiles() - currentCount;
    const filesToProcess = Array.from(fileList).slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const url = e.target?.result as string;
        // Mise à jour atomique du Signal
        this.previews.update(prev => [...prev, {file, url}]);
        this.emitChanges();
      };
      reader.readAsDataURL(file);
    });
  }

  removeFile(index: number) {
    this.previews.update(prev => {
      const newState = [...prev];
      newState.splice(index, 1);
      return newState;
    });
    this.emitChanges();
  }

  reorderFiles(event: CdkDragDrop<ImagePreview[]>) {
    this.previews.update(prev => {
      const newState = [...prev];
      moveItemInArray(newState, event.previousIndex, event.currentIndex);
      return newState;
    });
    this.emitChanges();
  }

  private emitChanges() {
    this.filesChanged.emit(this.previews().map(p => p.file));
  }
}
