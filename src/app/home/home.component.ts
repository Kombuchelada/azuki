import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LogInComponent } from '../log-in/log-in.component';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, LogInComponent, DialogComponent],
})
export class HomeComponent {
  @ViewChild('logInDialog') logInDialog:
    | ElementRef<HTMLDialogElement>
    | undefined;
  showLogInModal = false;
}
