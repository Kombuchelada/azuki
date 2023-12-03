import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../services/supabase.service';
import { Profile } from '../models/profile.model';
import { map, of, switchMap } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, RouterLink],
  templateUrl: './account.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountComponent {
  profile = signal<Profile | null>(null);

  constructor(
    private supabase: SupabaseService,
    private authService: AuthService
  ) {
    this.authService.session$
      .pipe(
        switchMap((session) => {
          if (session) {
            return this.supabase.profile(session.user.id);
          }
          return of(null);
        }),
        map((profile) => {
          if (profile) {
            this.profile.set(profile.data);
          }
        })
      )
      .subscribe();
  }
}
