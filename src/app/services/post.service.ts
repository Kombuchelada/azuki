import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable, from, of, switchMap } from 'rxjs';
import { TABLES } from '../constants/tables.constant';
import { PostgrestSingleResponse } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  constructor(private supabase: SupabaseService) {}

  createPost(post: {
    title: string;
    content: string;
    author_id?: string;
  }): Observable<PostgrestSingleResponse<null> | null> {
    return this.supabase.session.pipe(
      switchMap((session) => {
        if (!session) {
          return of(null);
        }
        post.author_id = session.user.id;
        return from(this.supabase.client.from(TABLES.POSTS).insert(post));
      })
    );
  }
}
