import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LOADING_DIALOG } from '../constants/loading-dialog.constant';

@Component({
  selector: 'app-loading-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatProgressSpinnerModule],
  templateUrl: './loading-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public caption = LOADING_DIALOG.DEFAULT
  ) {}
}
