import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../services/supabase.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subject, tap, filter, map, switchMap, Observable, take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthResponse } from '@supabase/supabase-js';

@Component({
  selector: 'app-signup-component',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './signup-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignupComponent {

  signupForm = new FormGroup({
    "email": new FormControl('', {
      validators: [Validators.email, Validators.required],
      updateOn: 'blur'
    }),
    "password": new FormControl('', [Validators.required, Validators.minLength(12)])
  });

  get email(): FormControl<string | null> {
    return this.signupForm.controls.email;
  }

  get password(): FormControl<string | null> {
    return this.signupForm.controls.password;
  }

  protected signingUp$ = new Subject<boolean>();
  protected signUp$ = this.signingUp$.pipe(
    filter((loading) => loading === true),
    filter(() => {
      if (this.signupForm.invalid) {
        console.log("form invalid!");
        return false;
      }
      return true;
    }),
    tap(() => {
      console.log("from tap")
    }),
    switchMap(() => {
      return this.register();
    }),
    map((tokenResponse) => {
      if (!tokenResponse) {
        console.log("token response null");
      }
      if (tokenResponse.error) {
        console.log("Token response error");
        return;
      }
    })
  )

  constructor(
    private supabase: SupabaseService,
  ) {
    this.signUp$.pipe(takeUntilDestroyed()).subscribe();
  }

  private register(): Observable<AuthResponse> {
    const { email, password } = this.signupForm.getRawValue();
    return this.supabase.registerUser(email as string, password as string).pipe(take(1));
  }
}
