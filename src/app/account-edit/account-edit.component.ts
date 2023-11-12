import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { SNACKBAR_ACTIONS } from '../constants/snackbar-actions.constant';
import { SNACKBAR_DURATIONS } from '../constants/snackbar-durations.constant';
import { SNACKBAR_MESSAGES } from '../constants/snackbar-messsages.constant';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  ],
  templateUrl: './account-edit.component.html',
  styleUrl: './account-edit.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountEditComponent {
  profile = signal<Profile | null>(null);
  session = signal<Session | null>(null);

  profileForm = new FormGroup({
    fullName: new FormControl('', [
      Validators.required,
      Validators.maxLength(255),
    ]),
  });

  get fullName(): FormControl<string | null> {
    return this.profileForm.controls.fullName;
  }

  submitting$ = new Subject<boolean>();
  submitForm$ = this.submitting$.pipe(
    filter((loading) => loading),
    filter(() => {
      if (this.profileForm.invalid) {
        this.snackBar.open(
          SNACKBAR_MESSAGES.FORM_INVALID,
          SNACKBAR_ACTIONS.DISMISS,
          {
            duration: SNACKBAR_DURATIONS.DEFAULT,
          }
        );
        return false;
      }
      return true;
    }),
    switchMap(() => this.submitForm()),
    tap(() => this.submitting$.next(false)),
    map((response) => {
      if (!response) {
        this.snackBar.open(
          SNACKBAR_MESSAGES.SUBMISSION_FAILED,
          SNACKBAR_ACTIONS.DISMISS,
          {
            duration: SNACKBAR_DURATIONS.DEFAULT,
          }
        );
        return;
      }
      if (response.error) {
        this.snackBar.open(response.error.message, SNACKBAR_ACTIONS.DISMISS, {
          duration: SNACKBAR_DURATIONS.DEFAULT,
        });
        return;
      }
      this.snackBar.open(
        SNACKBAR_MESSAGES.PROFILE_UPDATED,
        SNACKBAR_ACTIONS.DISMISS,
        {
          duration: SNACKBAR_DURATIONS.DEFAULT,
        }
      );
    })
  );

  constructor(
    private supabase: SupabaseService,
    private snackBar: MatSnackBar
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
            this.profileForm.enable();
          }
        })
      )
      .subscribe();

    this.submitForm$.pipe(takeUntilDestroyed()).subscribe();
  }

  private submitForm(): Observable<PostgrestSingleResponse<null> | null> {
    const newProfile = this.profile();
    if (!newProfile) {
      return of(null);
    }
    newProfile.full_name = this.fullName.value as string;
    return this.supabase.updateProfile(newProfile);
  }
}
