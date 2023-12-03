import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { switchMap, of, map, Subject, filter, tap, Observable } from 'rxjs';
import { Profile } from '../models/profile.model';
import { Session } from '@supabase/supabase-js';
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
import { SnackbarService } from '../services/snackbar.service';
import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';
import { ProfilePictureComponent } from '../profile-picture/profile-picture.component';

@Component({
  selector: 'app-account-edit',
  standalone: true,
  templateUrl: './account-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    ProfilePictureComponent,
  ],
})
export class AccountEditComponent {
  @ViewChild('avatarPreview') avatarPreview!: ElementRef<HTMLImageElement>;
  profile = signal<Profile | null>(null);
  session = signal<Session | null>(null);

  profileForm = new FormGroup({
    fullName: new FormControl('', [
      Validators.required,
      Validators.maxLength(255),
    ]),
    bio: new FormControl<string>('', {
      nonNullable: true,
      validators: Validators.maxLength(4000),
    }),
  });

  get fullName(): FormControl<string | null> {
    return this.profileForm.controls.fullName;
  }

  get bio(): FormControl<string> {
    return this.profileForm.controls.bio;
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
    switchMap(() => this.submitForm()),
    tap(() => this.submitting$.next(false)),
    map(() => this.snackbarService.show(SNACKBAR_MESSAGES.PROFILE_UPDATED))
  );

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private snackbarService: SnackbarService
  ) {
    this.profileForm.disable();
    this.authService.session$
      .pipe(
        takeUntilDestroyed(),
        switchMap((session) => {
          if (session) {
            this.session.set(session);
            return this.profileService.getOne(session.user.id);
          }
          return of(null);
        }),
        map((profile) => {
          if (profile) {
            this.profile.set(profile);
            this.fullName.setValue(profile.full_name);
            this.bio.setValue(profile.bio);
            this.profileForm.enable();
          }
        })
      )
      .subscribe();

    this.submitForm$.pipe(takeUntilDestroyed()).subscribe();
  }

  private submitForm(): Observable<void> {
    const newProfile = this.profile();
    if (!newProfile) {
      return of();
    }
    newProfile.full_name = this.fullName.value as string;
    newProfile.bio = this.bio.value as string;
    return this.profileService.put(newProfile);
  }
}
