import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Profile } from '../models/profile.model';
import { map, of, switchMap } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';

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
    private profileService: ProfileService,
    private authService: AuthService
  ) {
    this.authService.session$
      .pipe(
        switchMap((session) => {
          if (session) {
            return this.profileService.getOne(session.user.id);
          }
          return of(null);
        }),
        map((profile) => {
          if (profile) {
            this.profile.set(profile);
          }
        })
      )
      .subscribe();
  }
}
