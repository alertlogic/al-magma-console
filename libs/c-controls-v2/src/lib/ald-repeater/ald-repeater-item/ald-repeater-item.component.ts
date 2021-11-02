import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ald-repeater-item',
  templateUrl: './ald-repeater-item.component.html',
  styleUrls: ['./ald-repeater-item.component.css']
})
export class AldRepeaterItemComponent {

  @Input() inline: boolean = true;
  @Input() header: string = '';
  @Output() didRemoveItem: EventEmitter<void> = new EventEmitter();

}
