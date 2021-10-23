import { ThreatRating } from '../al-threat-rating/al-threat-rating.component';
import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';

@Component({
   selector: 'ald-threat-summary',
   templateUrl: './al-threat-summary.component.html'
 })
 export class AlThreatSummaryComponent implements OnInit, OnChanges {

  @Input() label: string;
  @Input() threats: {critical: number, high: number, medium: number, low: number, info: number};
  @Input() actions: any[];
  @Input() noThreatText: string = 'No Current Threats';

  @Output() didActionItem: EventEmitter<any> = new EventEmitter();

  threatSummary: ThreatRating;

  ngOnInit() {
    this.threatSummary = this.summariseThreat(this.threats);
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        const change = changes[propName];
        switch (propName) {
          case 'threats': {
            this.threatSummary = this.summariseThreat(change.currentValue);
          }
        }
      }
    }
  }

  summariseThreat(threats): ThreatRating {
    if (threats.critical) {
      return ThreatRating.critical;
    } else if (threats.high) {
      return ThreatRating.high;
    } else if (threats.medium) {
      return ThreatRating.medium;
    } else if (threats.low) {
      return ThreatRating.low;
    } else if (threats.info) {
      return ThreatRating.info;
    } else {
      return;
    }
  }

  public actionSelected(action) {
    this.didActionItem.emit(action);
  }

 }
