/**
 * @author Megan Castleton <megan.castleton@alertlogic.com>
 * @author Stephen Jones <stephen.jones@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2019
 */
import {
  Input,
  Component,
  OnChanges,
  SimpleChanges } from '@angular/core';
import { numberContract } from '../formatters';
import { CountSummaryChangeDirection, CountSummaryChangeType, CountSummaryPresentation, CountSummaryData } from '../types';

@Component({
    selector: 'al-count-summary',
    templateUrl: './al-count-summary.component.html',
    styleUrls: ['./al-count-summary.component.scss']
})

/*
 *
 */
export class AlCountSummaryComponent implements OnChanges {

  public changeDirection: CountSummaryChangeDirection = CountSummaryChangeDirection.Flat;

  @Input() presentation: CountSummaryPresentation;
  @Input() data: CountSummaryData = {
    primaryCount: 0
  };

  /*
   *
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('data')) {
      const changeCount:number = changes.data.currentValue.changeCount;
      this.changeDirection = changeCount > 0 ? CountSummaryChangeDirection.Up : changeCount < 0 ? CountSummaryChangeDirection.Down : CountSummaryChangeDirection.Flat;
    }
    if (changes.hasOwnProperty('presentation') && changes.presentation.currentValue === null) {
      this.presentation = this.getPresentationDefaults();
    } else {
      this.presentation = Object.assign({}, this.getPresentationDefaults(), changes.presentation.currentValue);
    }
  }

  /*
   *
   */
  public compactCount(count: number): string {
    const nc = numberContract(count);
    return `${nc.count}<span>${nc.suffix}</span>`;
  }

  /*
   *
   */
  public changeColor(changeType: CountSummaryChangeType): string {
    if (this.data.changeCount === 0) {
      return this.presentation.changeColorFlat;
    } else {
      return changeType === CountSummaryChangeType.Good
        ? this.presentation.changeColorGood
        : this.presentation.changeColorBad;
    }
  }

  /*
   *
   */
  public percentageChange(currentCount: number, changeCount: number): string {
    let lastCount:number = currentCount - changeCount;
    let percentage:number = changeCount / lastCount * 100;

    if (currentCount === changeCount) {
      percentage = changeCount === 0 ? 0 : 100;
    }
    return `${Number(percentage).toFixed(1)}%`;
  }

  /*
   *
   */
  private getPresentationDefaults(): CountSummaryPresentation {
    return {
      changeColorGood: '',
      changeColorBad: '',
      changeColorFlat: '',
      showPercentage: true,
      primaryFontSize: 100,
      changeAmountLabel: 'Change Amount',
      percentageAmountLabel: 'Change Percent'
    };
  }
}
