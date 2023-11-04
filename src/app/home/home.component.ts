import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LogInComponent } from '../log-in/log-in.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, LogInComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  @ViewChild('logInDialog') logInDialog:
    | ElementRef<HTMLDialogElement>
    | undefined;
  showLogInModal(): void {
    if (this.logInDialog) {
      this.logInDialog.nativeElement.showModal();
    }
  }
  closeLogInModal(): void {
    if (this.logInDialog) {
      this.logInDialog.nativeElement.close();
    }
  }
}
