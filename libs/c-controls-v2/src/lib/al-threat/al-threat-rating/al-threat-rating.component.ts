import { Component, Input, OnInit } from '@angular/core';

export enum ThreatRating {
  critical = 'critical',
  high = 'high',
  medium = 'medium',
  low = 'low',
  info = 'info'
}

@Component({
  selector: 'ald-threat-rating',
  templateUrl: './al-threat-rating.component.html'
})
export class AlThreatRatingComponent implements OnInit {

  @Input() threatRating: ThreatRating | string;
  @Input() iconOnly: boolean = false;
  @Input() inline: boolean = false;

  threat: {icon: string, color: string, label: string} | null;

  constructor() { }

  ngOnInit(): void {
    this.setThreat();
  }

  setThreat() {

    let threatValue: ThreatRating;

    if (typeof this.threatRating === 'string') {
      const threatToLowerCase = this.threatRating.toLowerCase();
      threatValue = ThreatRating[threatToLowerCase];
    } else {
      threatValue = this.threatRating;
    }

    switch (threatValue) {
      case ThreatRating.critical:
        this.threat = {icon: 'al-risk-1', color: 'u-text-threat-critical', label: 'critical'};
        break;
      case ThreatRating.high:
        this.threat = {icon: 'al-risk-2', color: 'u-text-threat-high', label: 'high'};
        break;
      case ThreatRating.medium:
        this.threat = {icon: 'al-risk-3', color: 'u-text-threat-medium', label: 'medium'};
        break;
      case ThreatRating.low:
        this.threat = {icon: 'al-risk-1', color: 'u-text-threat-low', label: 'low'};
        break;
      case ThreatRating.info:
        this.threat = {icon: 'al-risk-4', color: 'u-text-threat-info', label: 'info'};
        break;
      default:
        this.threat = null;
    }
  }

}
