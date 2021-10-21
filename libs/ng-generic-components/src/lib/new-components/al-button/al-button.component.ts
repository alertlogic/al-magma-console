import { Component, Input } from '@angular/core';

export enum BtnType {
  default = 'default',
  defaultOutline = 'default-outline',
  defaultGhost = 'default-ghost',
  primary = 'primary',
  primaryOutline = 'primary-outline',
  primaryGhost = 'primary-ghost',
  light = 'light',
  lightOutline = 'light-outline',
  lightGhost = 'light-ghost',
  danger = 'danger',
  success = 'success'
}

@Component({
  selector: 'al2-button',
  templateUrl: './al-button.component.html'
})
export class AlButtonComponent {

  @Input() label:       string = '';
  @Input() type?:       BtnType = BtnType.default;
  @Input() icon?:       string = '';
  @Input() iconClass?:  string = 'material-icons';
  @Input() iconPos?:    string = 'left';
  @Input() size?:       string = 'md';
  @Input() disabled?:   boolean = false;
  @Input() selected?:   boolean = false;


  constructor() {}

}
