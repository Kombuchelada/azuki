import {
  ChangeDetectionStrategy,
  Component,
  Input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { BUCKETS } from '../constants/buckets.constant';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FileService } from '../services/file.service';
import { Profile } from '../models/profile.model';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ProfilePictureEditComponent } from '../profile-picture-edit/profile-picture-edit.component';

@Component({
  selector: 'app-profile-picture',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './profile-picture.component.html',
  styleUrl: 'profile-picture.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePictureComponent {
  @Input() profile: Profile | null = null;
  loading = signal(true);

  dialogRef!: MatDialogRef<ProfilePictureEditComponent>;

  get publicAvatarUrl(): string {
    if (this.profile !== null && this.profile.avatar_url?.length > 0) {
      return this.fileService.getPublicUrl(
        BUCKETS.AVATARS,
        this.profile.avatar_url
      );
    }
    return '';
  }

  constructor(private fileService: FileService, private dialog: MatDialog) {}

  showEditDialog(): void {
    this.dialogRef = this.dialog.open(ProfilePictureEditComponent, {
      data: this.profile,
      minWidth: '80vw',
      minHeight: '80vh',
    });
  }
}
