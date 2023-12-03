import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable, from } from 'rxjs';
import { TABLES } from '../constants/tables.constant';
import { Profile } from '../models/profile.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(private supabase: SupabaseService) {}

  get(id: string): Observable<Profile> {
    return from(
      this.supabase.client
        .from(TABLES.PROFILES)
        .select(`id, username, full_name, avatar_url, bio`)
        .eq('id', id)
        .single()
        .then((response) => {
          return response.data as Profile;
        })
    );
  }

  // put(profile: Profile) {

  // }

  // updateProfile(profile: Profile): Observable<PostgrestSingleResponse<null>> {
  //   const update = {
  //     ...profile,
  //     updated_at: new Date(),
  //   };

  //   return from(this.client.from(TABLES.PROFILES).upsert(update));
  // }
}
