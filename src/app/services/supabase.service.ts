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
import { StorageError, FileObject } from '@supabase/storage-js';

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
        .select(`id, username, full_name, avatar_url, bio`)
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

  downloadFile(bucket: BUCKETS, path: string) {
    return from(this.supabase.storage.from(bucket).download(path));
  }

  uploadFile(
    bucket: BUCKETS,
    filePath: string,
    file: File
  ): Observable<
    | {
        data: {
          path: string;
        };
        error: null;
      }
    | {
        data: null;
        error: StorageError;
      }
  > {
    return from(
      this.supabase.storage.from(BUCKETS.AVATARS).upload(filePath, file)
    );
  }

  deleteFiles(
    bucket: BUCKETS,
    filePaths: string[]
  ): Observable<
    | {
        data: FileObject[];
        error: null;
      }
    | {
        data: null;
        error: StorageError;
      }
  > {
    return from(this.supabase.storage.from(bucket).remove(filePaths));
  }

  getFullStorageUrl(bucketName: BUCKETS, path: string): string {
    return this.supabase.storage.from(bucketName).getPublicUrl(path).data
      .publicUrl;
  }
}
