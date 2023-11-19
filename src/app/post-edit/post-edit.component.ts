import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-post-edit',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
  ],
  templateUrl: './post-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostEditComponent {
  postForm = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(512)],
    }),
    content: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(4000000)],
    }),
  });

  get title(): FormControl<string> {
    return this.postForm.controls.title;
  }

  get content(): FormControl<string> {
    return this.postForm.controls.content;
  }

  submitPost(): void {}
}
