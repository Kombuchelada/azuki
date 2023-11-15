import { Injectable } from '@angular/core';
import {
  AuthChangeEvent,
  AuthError,
  AuthSession,
  AuthTokenResponse,
  createClient,
  PostgrestSingleResponse,
  Session,
  SupabaseClient,
} from '@supabase/supabase-js';
import { from, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Profile } from '../models/profile.model';
import { BUCKETS } from '../constants/buckets.constant';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  _session: AuthSession | null = null;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  get session(): Observable<AuthSession | null> {
    return from(
      this.supabase.auth.getSession().then(({ data }) => {
        return data.session;
      })
    );
  }

  profile(id: string): Observable<PostgrestSingleResponse<Profile>> {
    return from(
      this.supabase
        .from('profiles')
        .select(`id, username, full_name, avatar_url`)
        .eq('id', id)
        .single()
    );
  }

  authChanges(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  logIn(email: string, password: string): Observable<AuthTokenResponse> {
    return from(this.supabase.auth.signInWithPassword({ email, password }));
  }

  signOut(): Observable<{ error: AuthError | null }> {
    return from(this.supabase.auth.signOut());
  }

  updateProfile(profile: Profile): Observable<PostgrestSingleResponse<null>> {
    const update = {
      ...profile,
      updated_at: new Date(),
    };

    return from(this.supabase.from('profiles').upsert(update));
  }

  downLoadImage(path: string) {
    return from(this.supabase.storage.from('avatars').download(path));
  }

  // StorageError doesn't seem to be exposed in the supabase api,
  // and if its a postgrest error I can't find that one either so I've
  // left the return type implied for now.
  uploadAvatar(filePath: string, file: File) {
    console.log('uploading');
    console.log(filePath);
    console.log(file);
    return from(this.supabase.storage.from('avatars').upload(filePath, file));
  }

  getFullUrl(bucketName: BUCKETS, path: string): string {
    return this.supabase.storage.from(bucketName).getPublicUrl(path).data
      .publicUrl;
  }
}
