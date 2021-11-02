import { AlDropdownComponent } from '../../al-dropdown/al-dropdown.component';
import { AlOptionItem } from '../../types/al-common.types';
import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';

@Component({
  selector: 'ald-multiselect',
  templateUrl: './al-multiselect.component.html',
	styleUrls: ['./al-multiselect.component.scss']
})
export class AlMultiselectComponent {

  @ViewChild('multiSelectDropdown') multiSelectDropdown: AlDropdownComponent;

  // Button Inputs
  @Input() type?: string = 'default';
  @Input() size?: string = 'md';
  @Input() label?: string = 'Select Options';
  @Input() icon?: string = 'expand_more';
  @Input() iconPos?: string = 'right';
  @Input() iconClass?: string = 'material-icons';
  @Input() disabled?: boolean;
  @Input() selected?: boolean;

  @Input() search?: boolean;
  @Input() options: AlOptionItem[] = [];


  // Action Buttons
  @Input() primaryButtonLabel: string = 'Apply';
  @Input() secondaryButtonLabel: string = 'Clear';
  @Output() primaryAction: EventEmitter<AlOptionItem[]> = new EventEmitter();
  @Output() secondaryAction: EventEmitter<any> = new EventEmitter();


  primaryButtonAction() {
    this.multiSelectDropdown.close();
    this.primaryAction.emit(this.options);
  }

  secondaryButtonAction() {
    this.multiSelectDropdown.close();
    this.secondaryAction.emit();
  }

}
