import { AlOptionItem } from '../../types/al-generic.types';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'al2-menu',
  templateUrl: './al-menu.component.html'
})
export class AlMenuComponent implements OnInit {

  @Input() options: AlOptionItem[] = [];
  @Output() selectedOption: EventEmitter<AlOptionItem> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  selectedItem(item: AlOptionItem) {
    this.selectedOption.emit(item);
  }

}
