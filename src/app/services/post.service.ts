import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable, from, map, of, switchMap } from 'rxjs';
import { TABLES } from '../constants/tables.constant';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { SnackbarService } from './snackbar.service';
import { Post } from '../models/post.model';
import { PostDto } from '../models/dtos/post.dto';
import { BUCKETS } from '../constants/buckets.constant';

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

  getRecentPosts(numberOfPosts = 10): Observable<Post[]> {
    const query = this.supabase.client
      .from(TABLES.POSTS)
      .select(
        'id, created_at, title, content, profile:author_id(username, full_name, avatar_url)'
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
        const dtos = response.data as unknown as PostDto[];
        return dtos.map((dto) => this.mapDtoToModel(dto));
      })
    );
  }

  private mapDtoToModel(dto: PostDto): Post {
    let fullAvatarUrl = '';
    if (dto.profile.avatar_url) {
      fullAvatarUrl = this.supabase.getFullStorageUrl(
        BUCKETS.AVATARS,
        dto.profile.avatar_url
      );
    }
    return {
      id: dto.id,
      createdAt: new Date(dto.created_at),
      profile: {
        username: dto.profile.username,
        fullName: dto.profile.full_name,
        avatarUrl: fullAvatarUrl,
      },
      title: dto.title,
      content: dto.content,
    } as Post;
  }
}
