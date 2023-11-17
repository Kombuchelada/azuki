import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SNACKBAR_ACTIONS } from '../constants/snackbar-actions.constant';
import { SNACKBAR_DURATIONS } from '../constants/snackbar-durations.constant';
import { SNACKBAR_MESSAGES } from '../constants/snackbar-messsages.constant';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  constructor(private snackbar: MatSnackBar) {}

  customError(error: string): void {
    this.snackbar.open(error, SNACKBAR_ACTIONS.DISMISS, {
      duration: SNACKBAR_DURATIONS.DEFAULT,
    });
  }

  show(message: SNACKBAR_MESSAGES): void {
    this.snackbar.open(message, SNACKBAR_ACTIONS.DISMISS, {
      duration: SNACKBAR_DURATIONS.DEFAULT,
    });
  }
}
