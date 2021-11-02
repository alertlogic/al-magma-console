import { Component, Input, OnInit } from '@angular/core';
import { IconClass } from '../../types';

@Component({
  selector: 'ald-table-cell-icon',
  templateUrl: './table-cell-icon.component.html'
})
export class AlTableCellIconComponent implements OnInit{


    @Input() icon: string;
    @Input() iconClass?: IconClass;
    @Input() color?: string;
    @Input() title?: string;

    ngOnInit() {

      if (typeof this.color !== 'string') {
        this.color = '';
      }

      if (typeof this.iconClass !== 'string') {
        this.iconClass = IconClass.materialIcons;
      }
    }

}
