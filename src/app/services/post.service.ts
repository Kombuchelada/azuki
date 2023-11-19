import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable, from, map, of, switchMap } from 'rxjs';
import { TABLES } from '../constants/tables.constant';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { SnackbarService } from './snackbar.service';
import { Post } from '../models/post.model';
import { PostDto } from '../models/dtos/post.dto';

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
        'id, created_at, title, content, profile (username, full_name, avatar_url)'
      )
      .order('created_at', { ascending: false })
      .limit(numberOfPosts);
    return from(query).pipe(
      map((response) => {
        if (response.error) {
          this.snackbarService.customError(response.error.message);
          return [];
        }
        const dtos = response.data as PostDto[];
        return dtos.map((dto) => this.convertDtoToModel(dto));
      })
    );
  }

  private convertDtoToModel(dto: PostDto): Post {
    return {
      id: dto.id,
      createdAt: new Date(dto.created_at),
      authorId: dto.author_id,
      title: dto.title,
      content: dto.content,
    } as Post;
  }
}
