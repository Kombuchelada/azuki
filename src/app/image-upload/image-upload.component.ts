import {
  AfterViewInit,
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

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './image-upload.component.html',
  styles: `.image-icon-size {
    height: 250px;
    width: 250px;
    font-size: 250px;
  }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageUploadComponent implements OnChanges, AfterViewInit {
  @ViewChild('filePreview') filePreview!: ElementRef<HTMLImageElement>;
  @Input() label = TEMPLATE_STRINGS.AVATAR_LABEL;
  @Input() avatarUrl: string = '';
  @Output() fileSelected = new EventEmitter<File | null>();
  imageLoaded = signal(false);

  constructor(private supabase: SupabaseService) {}

  ngAfterViewInit(): void {
    this.showImage();
  }

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

  private showImage(): void {
    if (!this.filePreview) {
      return;
    }
    if (this.avatarUrl.length === 0) {
      this.filePreview.nativeElement.src = '';
      return;
    }
    console.log('avatar url');
    console.log(this.avatarUrl);
    this.filePreview.nativeElement.src = this.supabase.getFullStorageUrl(
      BUCKETS.AVATARS,
      this.avatarUrl
    );
  }
}
