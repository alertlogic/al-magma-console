import { Input, Output, Component, EventEmitter } from '@angular/core';
import { AlStateFilterDescriptor } from './al-state-filter-descriptor.type';

@Component({
  selector: 'al-state-filter',
  templateUrl: './al-state-filter.component.html',
  styleUrls: ['./al-state-filter.component.scss']
})

export class AlStateFilterComponent {

    @Input() selectedState: AlStateFilterDescriptor;
    @Input() stateFilters: { value: AlStateFilterDescriptor; disabled?: boolean}[] = [];

    @Output() filterSelected: EventEmitter<{originalEvent:Event, value: AlStateFilterDescriptor}> = new EventEmitter<{originalEvent:Event, value: AlStateFilterDescriptor}>();

    /*
    * State selected
    */
    public selectState = (event: {originalEvent:Event, value: AlStateFilterDescriptor}): void => {
      this.filterSelected.emit(event);
    }
}
