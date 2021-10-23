import { BadgeType, IconClass, BtnType } from './../types/al-common.types';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';

@Component({
  selector: 'ald-badge',
  templateUrl: './al-badge.component.html',
  styleUrls: ['./al-badge.component.scss']
})
export class AlBadgeComponent implements OnInit{

  @Input() label: string;
  @Input() icon?: string;
  @Input() iconClass?: IconClass = IconClass.materialIcons;
  @Input() type?: BadgeType = BadgeType.light;
  @Input() actionIcon?: string;

  @Output() didAction: EventEmitter<void> = new EventEmitter<void>();

  buttonType: BtnType;

  constructor() { }

  ngOnInit() {
    switch (this.type) {
      case BadgeType.light:
        this.buttonType = BtnType.defaultGhost;
        break;
      case BadgeType.warning:
        this.buttonType = BtnType.defaultGhost;
        break;
      default:
        this.buttonType = BtnType.lightGhost;
        break;
    }
  }

}
