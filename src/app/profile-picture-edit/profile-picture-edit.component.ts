import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  ViewChild,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { Profile } from '../models/profile.model';
import { FileService } from '../services/file.service';
import { BUCKETS } from '../constants/buckets.constant';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import {
  ImageCroppedEvent,
  ImageCropperModule,
  LoadedImage,
} from 'ngx-image-cropper';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-profile-picture-edit',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ImageCropperModule,
  ],
  templateUrl: './profile-picture-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: 'profile-picture-edit.component.scss',
})
export class ProfilePictureEditComponent {
  @ViewChild('profilePic') profilePic!: ElementRef<HTMLDivElement>;
  @ViewChild('cropper') cropper!: ElementRef<HTMLDivElement>;
  loading = signal(true);
  imageChangedEvent: any = '';
  croppedImage: any = '';

  get publicAvatarUrl(): string {
    if (this.profile !== null && this.profile.avatar_url?.length > 0) {
      return this.fileService.getPublicUrl(
        BUCKETS.AVATARS,
        this.profile.avatar_url
      );
    }
    return '';
  }
  constructor(
    public dialogRef: MatDialogRef<ProfilePictureEditComponent>,
    @Inject(MAT_DIALOG_DATA) public profile: Profile | null = null,
    private fileService: FileService,
    private sanitizer: DomSanitizer
  ) {}

  fileUploaded($event: Event) {
    console.log($event);
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(
      event.objectUrl as string
    );
    // event.blob can be used to upload the cropped image
  }
  imageLoaded(image: LoadedImage) {
    console.log('image loaded');
    console.log(image);

    this.cropper.nativeElement.classList.remove('hidden');
    setTimeout(() => {
      this.profilePic.nativeElement.classList.add('hidden-left');
      this.cropper.nativeElement.classList.add('unhidden');
    }, 100);
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    // show message
  }
}
