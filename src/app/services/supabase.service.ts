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
import { TABLES } from '../constants/tables.constant';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  client: SupabaseClient;
  _session: AuthSession | null = null;

  constructor() {
    this.client = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  get session(): Observable<AuthSession | null> {
    return from(
      this.client.auth.getSession().then(({ data }) => {
        return data.session;
      })
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

  authChanges(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ) {
    return this.client.auth.onAuthStateChange(callback);
  }

  logIn(email: string, password: string): Observable<AuthTokenResponse> {
    return from(this.client.auth.signInWithPassword({ email, password }));
  }

  signOut(): Observable<{ error: AuthError | null }> {
    return from(this.client.auth.signOut());
  }

  updateProfile(profile: Profile): Observable<PostgrestSingleResponse<null>> {
    const update = {
      ...profile,
      updated_at: new Date(),
    };

    return from(this.client.from(TABLES.PROFILES).upsert(update));
  }

  downloadFile(bucket: BUCKETS, path: string) {
    return from(this.client.storage.from(bucket).download(path));
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
      this.client.storage.from(BUCKETS.AVATARS).upload(filePath, file)
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
    return from(this.client.storage.from(bucket).remove(filePaths));
  }

  getFullStorageUrl(bucketName: BUCKETS, path: string): string {
    return this.client.storage.from(bucketName).getPublicUrl(path).data
      .publicUrl;
  }
}
