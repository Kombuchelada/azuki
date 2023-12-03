import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Profile } from '../models/profile.model';
import { FileService } from '../services/file.service';
import { BUCKETS } from '../constants/buckets.constant';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-profile-picture-edit',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './profile-picture-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
  .justify-end {
    justify-content: end !important;
  }
  `,
})
export class ProfilePictureEditComponent {
  loading = signal(true);
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
    @Inject(MAT_DIALOG_DATA) public profile: Profile | null = null,
    private fileService: FileService
  ) {}

  fileUploaded($event: Event) {
    console.log($event);
  }
}
