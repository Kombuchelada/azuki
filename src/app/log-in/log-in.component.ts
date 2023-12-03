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
  filter,
  map,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { AuthTokenResponse } from '@supabase/supabase-js';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LoadingDialogComponent } from '../loading-dialog/loading-dialog.component';
import { SNACKBAR_MESSAGES } from '../constants/snackbar-messsages.constant';
import { LOADING_DIALOG } from '../constants/loading-dialog.constant';
import { Router } from '@angular/router';
import { ROUTES } from '../constants/routes.constant';
import { SnackbarService } from '../services/snackbar.service';
import { AuthService } from '../services/auth.service';

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
        this.snackbarService.show(SNACKBAR_MESSAGES.FORM_INVALID);
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
        this.snackbarService.show(SNACKBAR_MESSAGES.LOGIN_FAILED);
        return;
      }
      if (tokenResponse.error) {
        this.snackbarService.customError(tokenResponse.error.message);
        return;
      }
      this.snackbarService.show(SNACKBAR_MESSAGES.WELCOME);
      this.router.navigate([ROUTES.HOME]);
    })
  );

  dialogRef!: MatDialogRef<LoadingDialogComponent>;

  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    private snackbarService: SnackbarService,
    private router: Router
  ) {
    this.logIn$.pipe(takeUntilDestroyed()).subscribe();
  }

  private logIn(): Observable<AuthTokenResponse | null> {
    if (this.logInForm.invalid) {
      return of(null);
    }
    const { email, password } = this.logInForm.getRawValue();
    return this.authService
      .logIn(email as string, password as string)
      .pipe(take(1));
  }
}
