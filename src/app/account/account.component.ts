import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../services/supabase.service';
import { AuthSession, User } from '@supabase/supabase-js';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountComponent implements OnInit {
  session: AuthSession | null = null;
  constructor(private supabase: SupabaseService) {}

  async ngOnInit(): Promise<void> {
    this.session = this.supabase.session;
    console.log(this.session);
    let {
      data: profile,
      error,
      status,
    } = await this.supabase.profile(this.session?.user as User);
  }
}
