import { AlOptionItem } from '../types/al-common.types';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'ald-menu',
  templateUrl: './al-menu.component.html',
  styleUrls: ['./al-menu.component.scss']
})
export class AlMenuComponent implements OnInit {

  @Input() options: AlOptionItem[] = [];
  @Output() selectedOption: EventEmitter<AlOptionItem> = new EventEmitter(); //  TO BE REMOVED: Deprecate this for the below output
  @Output() didSelect: EventEmitter<AlOptionItem> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  selectedItem(item: AlOptionItem) {
    this.selectedOption.emit(item);
  }

}
