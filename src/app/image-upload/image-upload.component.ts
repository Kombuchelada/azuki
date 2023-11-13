import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageUploadComponent {
  @ViewChild('filePreview') filePreview!: ElementRef<HTMLImageElement>;
  @Input() label!: string;
  @Output() fileSelected = new EventEmitter<File>();

  showPreview = signal(false);

  fileUploaded(fileUploadEvent: Event): void {
    const target = fileUploadEvent.target as HTMLInputElement;
    if (!target || !target.files || !target.files[0]) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e || !e.target) {
        return;
      }
      this.filePreview.nativeElement.src = e.target.result as string;
    };
    reader.readAsDataURL(target.files[0]);
    this.fileSelected.emit(target.files[0]);
    this.showPreview.set(true);
  }
}
