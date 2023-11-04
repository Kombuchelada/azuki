import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogInComponent {
  logInForm = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  get email(): FormControl<string | null> {
    return this.logInForm.controls.email;
  }

  get password(): FormControl<string | null> {
    return this.logInForm.controls.password;
  }

  async logIn(): Promise<void> {
    if (this.logInForm.invalid) {
      return;
    }
    // const { email, password } = this.logInForm.getRawValue();
    // try {
    //   const { data, error } = await this.supabase.logIn(email, password);
    //   if (error) {
    //     throw error;
    //   } else {
    //     this.toastService.addToast({
    //       severity: ToastSeverity.SUCCESS,
    //       header: 'Success',
    //       body: `Welcome back!`,
    //       timeToLiveMilliseconds: 5000,
    //     });
    //     this.close.emit();
    //   }
    // } catch (error) {
    //   if (error instanceof Error) {
    //     console.log(error.message);
    //     // switch (error.message) {
    //     //   case this.UNAME_EXISTS:
    //     //     this.username.setErrors({ exists: true });
    //     //     break;
    //     //   default:
    //     //     break;
    //     // }
    //   }
    // }
  }
}
