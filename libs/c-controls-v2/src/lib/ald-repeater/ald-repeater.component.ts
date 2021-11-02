import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ald-repeater',
  templateUrl: './ald-repeater.component.html',
  styleUrls: ['./ald-repeater.component.css']
})
export class AldRepeaterComponent {

  @Input() addButtonLabel: string = 'Add Item';

  @Output() didAddItem: EventEmitter<void> = new EventEmitter();

}
