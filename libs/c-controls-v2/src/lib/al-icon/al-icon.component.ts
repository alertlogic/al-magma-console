import { IconClass, IconSize } from './../types/al-common.types';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'ald-icon',
  templateUrl: './al-icon.component.html',
  styleUrls: ['./al-icon.component.scss']
})
export class AlIconComponent implements OnInit {

  @Input() icon: string = 'whatshot';
  @Input() iconClass?: IconClass = IconClass.materialIcons;
  @Input() size?: IconSize = IconSize.md;
  @Input() color?: string;

  constructor() { }

  ngOnInit(): void {
  }

}
