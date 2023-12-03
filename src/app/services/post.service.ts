import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable, from, map, switchMap } from 'rxjs';
import { TABLES } from '../constants/tables.constant';
import { PostgrestSingleResponse, Session } from '@supabase/supabase-js';
import { SnackbarService } from './snackbar.service';
import { Post } from '../models/post.model';
import { BUCKETS } from '../constants/buckets.constant';
import { RESPONSE_ERRORS } from '../constants/response.constant';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  constructor(
    private supabase: SupabaseService,
    private authService: AuthService,
    private snackbarService: SnackbarService
  ) {}

  createPost(post: {
    title: string;
    content: string;
    author_id?: string;
  }): Observable<PostgrestSingleResponse<null> | null> {
    return this.authService.session$.pipe(
      map((session) => {
        if (!session) {
          throw new Error(RESPONSE_ERRORS.SESSION_NULL);
        }
        return session as Session;
      }),
      switchMap((session) => {
        post.author_id = session.user.id;
        return from(this.supabase.client.from(TABLES.POSTS).insert(post));
      })
    );
  }

  getRecentPosts(numberOfPosts = 10): Observable<Post[]> {
    const query = this.supabase.client
      .from(TABLES.POSTS)
      .select(
        'id, createdAt:created_at, title, content, profile:author_id(username, fullName:full_name, avatarUrl:avatar_url)'
      )
      .order('created_at', { ascending: false })
      .limit(numberOfPosts);
    return from(query).pipe(
      map((response) => {
        if (response.error) {
          this.snackbarService.customError(response.error.message);
          return [];
        }
        /**
         * This is because of a lack of being able to specify related types
         * in the response. Because the supabase client doesn't know there can only be 1
         * profile matching the author_id, it suggests the profile is an array, but it is not.
         * It is a single object, and as far as I can tell, there is no way to assert the type
         * with the supabase or postgrest libraries.
         */
        const posts = response.data as unknown as Post[];
        posts.forEach((post) => {
          if (post.profile.avatarUrl) {
            post.profile.avatarUrl = this.supabase.getFullStorageUrl(
              BUCKETS.AVATARS,
              post.profile.avatarUrl
            );
          }
        });
        return posts;
      })
    );
  }
}
