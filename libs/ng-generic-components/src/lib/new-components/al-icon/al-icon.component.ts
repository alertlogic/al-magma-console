import { Component, Input, OnInit } from '@angular/core';

export enum IconSize {
  sm = 'sm',
  md = 'md',
  lg = 'lg',
  xl = 'xl'
}

export enum IconClass {
  al = 'al',
  materialIcons = 'material-icons',
  materialIconsOutlined = 'material-icons-outlined',
  materialIconsRound = 'material-icons-round'
}

@Component({
  selector: 'al2-icon',
  templateUrl: './al-icon.component.html'
})
export class AlIconComponent implements OnInit {

  @Input() icon: string = 'whatshot';
  @Input() iconClass?: IconClass|string = IconClass.materialIcons;
  @Input() size?: IconSize|string = IconSize.sm;
  @Input() color?: string;

  constructor() { }

  ngOnInit(): void {
  }

}
