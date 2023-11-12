import { ChangeDetectionStrategy, Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  Observable,
  Subject,
  delay,
  filter,
  map,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { SupabaseService } from '../services/supabase.service';
import { AuthTokenResponse } from '@supabase/supabase-js';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LoadingDialogComponent } from '../loading-dialog/loading-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SNACKBAR_MESSAGES } from '../constants/snackbar-messsages.constant';
import { SNACKBAR_ACTIONS } from '../constants/snackbar-actions.constant';
import { SNACKBAR_DURATIONS } from '../constants/snackbar-durations.constant';
import { LOADING_DIALOG } from '../constants/loading-dialog.constant';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogInComponent {
  logInForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.email, Validators.required],
      updateOn: 'blur',
    }),
    password: new FormControl('', [Validators.required]),
  });

  get email(): FormControl<string | null> {
    return this.logInForm.controls.email;
  }

  get password(): FormControl<string | null> {
    return this.logInForm.controls.password;
  }

  loggingIn$ = new Subject<boolean>();
  logIn$ = this.loggingIn$.pipe(
    filter((loading) => loading === true),
    filter(() => {
      if (this.logInForm.invalid) {
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
    tap(
      () =>
        (this.dialogRef = this.dialog.open(LoadingDialogComponent, {
          data: LOADING_DIALOG.LOGGING_IN,
        }))
    ),
    switchMap(() => this.logIn()),
    tap(() => this.loggingIn$.next(false)),
    tap(() => this.dialogRef.close()),
    map((tokenResponse) => {
      if (!tokenResponse) {
        this.snackBar.open(
          SNACKBAR_MESSAGES.LOGIN_FAILED,
          SNACKBAR_ACTIONS.DISMISS,
          {
            duration: SNACKBAR_DURATIONS.DEFAULT,
          }
        );
        return;
      }
      console.log(tokenResponse);
      if (tokenResponse.error) {
        this.snackBar.open(
          tokenResponse.error.message,
          SNACKBAR_ACTIONS.DISMISS,
          { duration: SNACKBAR_DURATIONS.DEFAULT }
        );
      }
    })
  );

  dialogRef!: MatDialogRef<LoadingDialogComponent>;

  constructor(
    private supabase: SupabaseService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.logIn$.pipe(takeUntilDestroyed()).subscribe();
  }

  private logIn(): Observable<AuthTokenResponse | null> {
    if (this.logInForm.invalid) {
      return of(null);
    }
    const { email, password } = this.logInForm.getRawValue();
    return this.supabase
      .logIn(email as string, password as string)
      .pipe(take(1));
  }
}
