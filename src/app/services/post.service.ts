import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable, from, map, of, switchMap } from 'rxjs';
import { TABLES } from '../constants/tables.constant';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { SnackbarService } from './snackbar.service';
import { Post } from '../models/post.model';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  constructor(
    private supabase: SupabaseService,
    private snackbarService: SnackbarService
  ) {}

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

  getPosts(): Observable<Post[]> {
    return from(this.supabase.client.from(TABLES.POSTS).select()).pipe(
      map((response) => {
        if (response.error) {
          this.snackbarService.customError(response.error.message);
          return [];
        }
        return response.data as Post[];
      })
    );
  }
}
