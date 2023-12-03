import { Injectable } from '@angular/core';
import {
  createClient,
  PostgrestSingleResponse,
  SupabaseClient,
} from '@supabase/supabase-js';
import { from, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Profile } from '../models/profile.model';
import { TABLES } from '../constants/tables.constant';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  client: SupabaseClient;

  constructor() {
    this.client = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  profile(id: string): Observable<PostgrestSingleResponse<Profile>> {
    return from(
      this.client
        .from(TABLES.PROFILES)
        .select(`id, username, full_name, avatar_url, bio`)
        .eq('id', id)
        .single()
    );
  }

  updateProfile(profile: Profile): Observable<PostgrestSingleResponse<null>> {
    const update = {
      ...profile,
      updated_at: new Date(),
    };

    return from(this.client.from(TABLES.PROFILES).upsert(update));
  }
}
