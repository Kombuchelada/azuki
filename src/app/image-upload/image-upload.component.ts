import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TEMPLATE_STRINGS } from '../constants/template.constant';
import { SupabaseService } from '../services/supabase.service';
import { BUCKETS } from '../constants/buckets.constant';
import { MatIconModule } from '@angular/material/icon';
import { map, take } from 'rxjs';
import { SnackbarService } from '../services/snackbar.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './image-upload.component.html',
  styles: `.image-icon-size, mat-icon.image-icon-size {
    height: 250px;
    width: 250px;
    font-size: 250px;
  }
  .spinner-margin {
    margin: 5rem;
  }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageUploadComponent implements OnChanges {
  @ViewChild('filePreview') filePreview!: ElementRef<HTMLImageElement>;
  @Input() label = TEMPLATE_STRINGS.AVATAR_LABEL;
  @Input() avatarUrl: string = '';
  @Output() fileSelected = new EventEmitter<File | null>();
  imageExists = signal(false);
  loading = signal(true);

  constructor(
    private supabase: SupabaseService,
    private snackbarService: SnackbarService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['avatarUrl'] && this.filePreview?.nativeElement) {
      this.showImage();
    }
  }

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
  }

  deleteImage(): void {
    this.supabase
      .deleteFiles(BUCKETS.AVATARS, [this.avatarUrl])
      .pipe(
        take(1),
        map((response) => {
          if (!response.error) {
            this.fileSelected.emit(null);
            this.imageExists.set(false);
            this.avatarUrl = '';
          } else {
            this.snackbarService.customError(response.error.message);
          }
        })
      )
      .subscribe();
  }

  private showImage(): void {
    if (!this.filePreview) {
      return;
    }
    if (this.avatarUrl.length === 0) {
      this.filePreview.nativeElement.src = '';
      this.imageExists.set(false);
      return;
    }
    this.imageExists.set(true);
    this.filePreview.nativeElement.src = this.supabase.getFullStorageUrl(
      BUCKETS.AVATARS,
      this.avatarUrl
    );
  }
}
