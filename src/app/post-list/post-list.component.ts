import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostService } from '../services/post.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Post } from '../models/post.model';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatDividerModule],
  templateUrl: './post-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostListComponent {
  posts = signal<Post[]>([]);
  constructor(private postService: PostService) {
    this.postService
      .getRecentPosts()
      .pipe(
        takeUntilDestroyed(),
        map((posts) => {
          this.posts.set(posts);
        })
      )
      .subscribe();
  }
}
