import { Component, Input, OnInit, HostBinding } from '@angular/core';
import { IconClass } from '../types';

@Component({
  selector: 'ald-dropdown',
  templateUrl: './al-dropdown.component.html',
  styleUrls: ['./al-dropdown.component.scss'],
})
export class AlDropdownComponent implements OnInit {

  @HostBinding('class') class = 'ald-dropdown';

  @Input() type?: string = 'default';
  @Input() size?: string = 'md';
  @Input() label?: string;
  @Input() icon?: string = 'expand_more';
  @Input() iconPos?: string = 'right';
  @Input() iconClass?: IconClass = IconClass.materialIcons;
  @Input() disabled?: boolean;
  @Input() selected?: boolean;
  @Input() width?: 'sm' | 'auto' | 'lg' = 'auto';

  isOpen = false;

  constructor() { }

  ngOnInit() {
  }

  close() {
    this.isOpen = false;
  }

}
