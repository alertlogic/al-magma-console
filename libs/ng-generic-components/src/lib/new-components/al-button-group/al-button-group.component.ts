import { AlButtonComponent } from './../al-button/al-button.component';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { BtnType } from '../al-button/al-button.component';

@Component({
  selector: 'al2-button-group',
  templateUrl: './al-button-group.component.html'
})
export class AlButtonGroupComponent implements OnInit {

  @Input() buttonGroup: AlButtonComponent[] = [];
  @Input() fullWidth?:  boolean = false;
  @Input() multiSelect?: boolean = false;

  @Output() onChange: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void { }

  setBtnType(btn: AlButtonComponent): BtnType {
    if (this.buttonGroup.length) {
      if (btn.selected) return BtnType.primaryOutline;
      return BtnType.defaultOutline;
    } else {
      return btn.type || BtnType.default;
    }
  }

  selectButton(index: number): void {

    if (!this.multiSelect) {
      this.buttonGroup.forEach(btn => {
        btn.selected = false;
      });

      this.buttonGroup[index].selected = true;
    } else {
      this.buttonGroup[index].selected = !this.buttonGroup[index].selected;
    }

    let selection = this.multiSelect ? this.buttonGroup : this.buttonGroup[index];
    this.onChange.emit(selection);
  }

}
