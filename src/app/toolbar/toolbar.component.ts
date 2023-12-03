import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { map, take } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SNACKBAR_MESSAGES } from '../constants/snackbar-messsages.constant';
import { SNACKBAR_ACTIONS } from '../constants/snackbar-actions.constant';
import { SNACKBAR_DURATIONS } from '../constants/snackbar-durations.constant';
import { USER_METADATA } from '../constants/user-metadata-properties.constant';
import { AuthService } from '../services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    RouterLink,
    MatButtonModule,
    MatMenuModule,
  ],
  templateUrl: './toolbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent {
  title = 'azuki';
  loggedIn = signal(false);
  username = signal('');

  constructor(private authService: AuthService, private snackbar: MatSnackBar) {
    this.authService.session$
      .pipe(
        takeUntilDestroyed(),
        map((session) => {
          if (session) {
            this.username.set(
              session.user.user_metadata[USER_METADATA.USERNAME]
            );
            this.loggedIn.set(true);
          } else {
            this.username.set('');
            this.loggedIn.set(false);
          }
        })
      )
      .subscribe();
  }

  logOut(): void {
    this.authService
      .logOut()
      .pipe(
        take(1),
        map((result) => {
          if (result.error) {
            this.snackbar.open(
              SNACKBAR_MESSAGES.AUTH_ERROR,
              SNACKBAR_ACTIONS.DISMISS,
              { duration: SNACKBAR_DURATIONS.DEFAULT }
            );
          } else {
            this.snackbar.open(
              SNACKBAR_MESSAGES.LOGGED_OUT,
              SNACKBAR_ACTIONS.DISMISS,
              {
                duration: SNACKBAR_DURATIONS.DEFAULT,
              }
            );
          }
        })
      )
      .subscribe();
  }
}
