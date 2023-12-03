import { Injectable } from '@angular/core';
import {
  createClient,
  PostgrestSingleResponse,
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
    return from(this.client.storage.from(bucket).upload(filePath, file));
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
