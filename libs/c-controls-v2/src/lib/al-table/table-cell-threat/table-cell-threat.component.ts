import { ThreatRating } from '../../al-threat/al-threat-rating/al-threat-rating.component';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'ald-table-cell-threat',
  templateUrl: './table-cell-threat.component.html'
})
export class AlTableCellThreatComponent {

    @Input() threat: ThreatRating;

}
