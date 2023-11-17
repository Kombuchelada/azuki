import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  switchMap,
  of,
  map,
  take,
  Subject,
  filter,
  tap,
  Observable,
  forkJoin,
} from 'rxjs';
import { Profile } from '../models/profile.model';
import { SupabaseService } from '../services/supabase.service';
import { PostgrestSingleResponse, Session } from '@supabase/supabase-js';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { SNACKBAR_MESSAGES } from '../constants/snackbar-messsages.constant';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { HTTP_STATUS_CODES } from '../constants/http-status-codes.constant';
import { SnackbarService } from '../services/snackbar.service';

@Component({
  selector: 'app-account-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    ImageUploadComponent,
  ],
  templateUrl: './account-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountEditComponent {
  @ViewChild('avatarPreview') avatarPreview!: ElementRef<HTMLImageElement>;
  profile = signal<Profile | null>(null);
  session = signal<Session | null>(null);

  //this only has 1 control right now but that will likely change,
  //so I'm leaving it as a formgroup
  profileForm = new FormGroup({
    fullName: new FormControl('', [
      Validators.required,
      Validators.maxLength(255),
    ]),
    avatarUrl: new FormControl<string>('', { nonNullable: true }),
    avatarFile: new FormControl<File | null>(null),
  });

  get fullName(): FormControl<string | null> {
    return this.profileForm.controls.fullName;
  }

  get avatarUrl(): FormControl<string> {
    return this.profileForm.controls.avatarUrl;
  }

  get avatarFile(): FormControl<File | null> {
    return this.profileForm.controls.avatarFile;
  }

  submitting$ = new Subject<boolean>();
  submitForm$ = this.submitting$.pipe(
    filter((loading) => loading),
    filter(() => {
      if (this.profileForm.invalid) {
        this.snackbarService.show(SNACKBAR_MESSAGES.FORM_INVALID);
        return false;
      }
      return true;
    }),
    switchMap(() => this.uploadAvatar()),
    map((uploadResult) => {
      if (uploadResult) {
        const fileName = uploadResult[0].fileName;
        const uploadResponse = uploadResult[1];
        if (uploadResponse.error) {
          //there is an error in the supabase typing. the error object has a
          //status code.
          const statusCode = (
            uploadResponse.error as unknown as { statusCode: string }
          ).statusCode;
          if (statusCode === HTTP_STATUS_CODES.CONFLICT_409) {
            this.avatarUrl.setValue(fileName);
          } else {
            this.snackbarService.customError(
              `${SNACKBAR_MESSAGES.IMAGE_UPLOAD_FAILED}: ${uploadResponse.error}`
            );
          }
        }
        if (uploadResponse?.data?.path) {
          this.avatarUrl.setValue(uploadResponse.data.path);
          return;
        }
      }
    }),
    switchMap(() => this.submitForm()),
    tap(() => this.submitting$.next(false)),
    map((response) => {
      if (!response) {
        this.snackbarService.show(SNACKBAR_MESSAGES.SUBMISSION_FAILED);
        return;
      }
      if (response.error) {
        this.snackbarService.customError(response.error.message);
        return;
      }
      this.snackbarService.show(SNACKBAR_MESSAGES.PROFILE_UPDATED);
    })
  );

  constructor(
    private supabase: SupabaseService,
    private snackbarService: SnackbarService
  ) {
    this.profileForm.disable();
    this.supabase.session
      .pipe(
        take(1),
        switchMap((session) => {
          if (session) {
            this.session.set(session);
            return this.supabase.profile(session.user.id);
          }
          return of(null);
        }),
        map((profile) => {
          if (profile?.data) {
            this.profile.set(profile.data);
            this.fullName.setValue(profile.data.full_name);
            if (profile.data.avatar_url) {
              this.avatarUrl.setValue(profile.data.avatar_url);
            }
            this.profileForm.enable();
          }
          return of(null);
        })
      )
      .subscribe();

    this.submitForm$.pipe(takeUntilDestroyed()).subscribe();
  }

  fileSelected(newFile: File): void {
    if (newFile) {
      this.avatarFile.setValue(newFile);
      return;
    }
    this.avatarFile.setValue(null);
    this.avatarUrl.setValue('');
  }

  private submitForm(): Observable<PostgrestSingleResponse<null> | null> {
    const newProfile = this.profile();
    if (!newProfile) {
      return of(null);
    }
    newProfile.full_name = this.fullName.value as string;
    newProfile.avatar_url = this.avatarUrl.value as string;
    return this.supabase.updateProfile(newProfile);
  }

  private uploadAvatar() {
    const profile = this.profile();
    if (!this.avatarFile.value || !profile || !profile.id) {
      return of(null);
    }

    const file = this.avatarFile.value;
    const fileExt = file.name.split('.').pop();
    const fileName = `public/${profile.id}.${fileExt}`;
    return forkJoin([
      of({ fileName: fileName }),
      this.supabase.uploadAvatar(fileName, file),
    ]);
  }
}
