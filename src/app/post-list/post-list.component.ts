import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostService } from '../services/post.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Post } from '../models/post.model';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatDividerModule, MatIconModule],
  templateUrl: './post-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .post-grid {
      grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr))
    }
  `,
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
