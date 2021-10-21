import { Component, Input, Output } from '@angular/core';

@Component({
  selector: 'app-fab-header',
  templateUrl: './fab-header.component.html',
  styleUrls: ['./fab-header.component.scss']
})

export class FabHeaderComponent {

  @Input() headerIcon: string = 'fa fa-bug';
  @Input() headerTitle: string = 'Testing App';
  @Input() showCalendar:"range"|"single" = "range";
  @Output() onDateRangeSelected : Event;

  public applyDateChange(dateRange:any) {
        console.log('date is ', dateRange);
    }

    public addButtonClicked( e: Event ) {
      console.log('add button click event ', e);
  }
}
