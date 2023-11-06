import { ChangeDetectionStrategy, Component } from '@angular/core';
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
import { take } from 'rxjs';
import { SupabaseService } from '../services/supabase.service';

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

  constructor(private supabase: SupabaseService) {}

  async logIn(): Promise<void> {
    if (this.logInForm.invalid) {
      return;
    }
    const { email, password } = this.logInForm.getRawValue();
    if (email === null && password === null) {
      return;
    }
    this.supabase
      .logIn(email as string, password as string)
      .pipe(take(1))
      .subscribe((response) => console.log(response));
  }
}
