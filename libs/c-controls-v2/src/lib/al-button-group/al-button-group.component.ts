import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { AlButtonComponent } from '../al-button/al-button.component';

@Component({
  selector: 'ald-button-group',
  templateUrl: './al-button-group.component.html',
  styleUrls: ['./al-button-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlButtonGroupComponent {

  @HostBinding('class') class = 'ald-btn-group';

  @Input() buttonGroup: AlButtonComponent[] = [];
  @Input() fullWidth?:  boolean;
  @Input() multiSelect?: boolean;

  @Output() didChange: EventEmitter<any> = new EventEmitter();

  constructor() {}

  public selectButton(index: number): void {

    if (!this.multiSelect) {
      this.buttonGroup.forEach(btn => {
        btn.selected = false;
      });

      this.buttonGroup[index].selected = true;
    } else {
      this.buttonGroup[index].selected = !this.buttonGroup[index].selected;
    }

    const selection = this.multiSelect ? this.buttonGroup : this.buttonGroup[index];
    this.didChange.emit(selection);
  }

}
