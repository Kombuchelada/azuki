import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent implements OnChanges {
  @ViewChild('mainDialog') dialog: ElementRef<HTMLDialogElement> | undefined;
  @Input() header = '';
  @Input() isModal = false;
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']) {
      if (this.visible) {
        if (this.isModal) {
          this.dialog?.nativeElement.showModal();
        }
        this.dialog?.nativeElement.show();
      } else {
        this.dialog?.nativeElement.close();
      }
    }
  }

  close(): void {
    this.visibleChange.emit(false);
    this.dialog?.nativeElement.close();
  }
}
