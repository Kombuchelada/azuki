import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { SupabaseService } from '../services/supabase.service';
import { map, take } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SNACKBAR_MESSAGES } from '../constants/snackbar-messsages.constant';
import { SNACKBAR_ACTIONS } from '../constants/snackbar-actions.constant';
import { SNACKBAR_DURATIONS } from '../constants/snackbar-durations.constant';
import { USER_METADATA } from '../constants/user-metadata-properties.constant';

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
  styleUrl: './toolbar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent {
  title = 'azuki';
  loggedIn = signal(false);
  username = signal('');

  constructor(
    private supabase: SupabaseService,
    private snackbar: MatSnackBar
  ) {
    this.supabase.authChanges((authEvent) => {
      switch (authEvent) {
        case 'SIGNED_IN':
          this.loggedIn.set(true);
          break;
        case 'SIGNED_OUT':
          this.loggedIn.set(false);
          break;
      }
      this.updateSession();
    });
  }

  private updateSession(): void {
    this.supabase.session
      .pipe(
        take(1),
        map((session) => {
          if (session) {
            this.username.set(
              session.user.user_metadata[USER_METADATA.USERNAME]
            );
          } else {
            this.username.set('');
          }
        })
      )
      .subscribe();
  }

  logOut(): void {
    this.supabase
      .signOut()
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
