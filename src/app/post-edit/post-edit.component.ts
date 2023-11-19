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
import { PostService } from '../services/post.service';
import { SnackbarService } from '../services/snackbar.service';
import { SNACKBAR_MESSAGES } from '../constants/snackbar-messsages.constant';

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

  constructor(
    private postService: PostService,
    private snackbarService: SnackbarService
  ) {}

  submitPost(): void {
    if (this.postForm.invalid) {
      this.snackbarService.show(SNACKBAR_MESSAGES.FORM_INVALID);
      return;
    }
    this.postService
      .createPost(this.postForm.getRawValue())
      .subscribe((response) => {
        if (!response) {
          this.snackbarService.show(SNACKBAR_MESSAGES.SUBMISSION_FAILED);
          return;
        }
        if (response.error) {
          this.snackbarService.customError(response.error.message);
          return;
        }
        //TODO: redirect to details view when it exists
      });
  }
}
