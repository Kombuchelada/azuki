import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-post-edit',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-edit.component.html',
  styleUrls: ['./post-edit.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostEditComponent {
  postForm = new FormGroup({
    title: new FormControl('', [
      Validators.required,
      Validators.maxLength(255),
    ]),
  });
}
