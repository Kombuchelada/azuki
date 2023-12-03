import { Injectable } from '@angular/core';
import { BUCKETS } from '../constants/buckets.constant';
import { SupabaseService } from './supabase.service';
import { Observable, from } from 'rxjs';
import { FileObject } from '@supabase/storage-js';

@Injectable({
  providedIn: 'root',
})
export class FileService extends SupabaseService {
  download(bucket: BUCKETS, path: string): Observable<Blob> {
    return from(
      this.client.storage
        .from(bucket)
        .download(path)
        .then((response) => {
          if (response.data) {
            return response.data;
          } else {
            throw new Error(response.error.message);
          }
        })
    );
  }

  /**
   * @returns the path of the uploaded file
   */
  upload(bucket: BUCKETS, path: string, file: File): Observable<string> {
    return from(
      this.client.storage
        .from(bucket)
        .upload(path, file)
        .then((response) => {
          if (response.data?.path) {
            return response.data.path;
          } else {
            throw new Error(response.error?.message);
          }
        })
    );
  }

  delete(bucket: BUCKETS, paths: string[]): Observable<FileObject[]> {
    return from(
      this.client.storage
        .from(bucket)
        .remove(paths)
        .then((response) => {
          if (response.data) {
            return response.data;
          } else {
            throw new Error(response.error.message);
          }
        })
    );
  }

  getPublicUrl(bucket: BUCKETS, path: string): string {
    return this.client.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }
}
