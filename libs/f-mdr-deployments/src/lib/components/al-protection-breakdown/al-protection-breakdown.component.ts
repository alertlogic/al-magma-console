
import { debounceTime } from 'rxjs/operators';
/**
 * AlProtectionBreakdownComponent show the scores with icons :D.
 * @author Juan Kremer <jkremer@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2018
 *
 * Sample about how to use it:
 * add in your ts component
    import {AlProtectionBreakdownDescriptor} from '../../design/types/al-protection-breakdown-descriptor.type';

 * add in your html
    <al-protection-breakdown [config]="alProtectionBreakdownconfig"></al-protection-breakdown>

 * where
    public alProtectionBreakdownConfig = AlProtectionBreakdownDescriptor.import([
        { count: 10, showCount: true, label: "UNPROTECTED", showLabel: true, hideLeftSeparator: true, iconClass: "fa fa-circle red-color", hideItem: false},
        { count: 0, showCount: false, label: "RULES APPLIED", showLabel: true, hideLeftSeparator: false, iconClass: "fa fa-circle orange-color", hideItem: false},
        { count: 0, showCount: false, label: "PROTECTED", showLabel: true, hideLeftSeparator: false, iconClass: "fa fa-circle green-color", hideItem: false},
        { count: 4, showCount: true, label: "Essentials", showLabel: true, hideLeftSeparator: true, iconClass: "al al-protection-1", hideItem: false},
        { count: 0, showCount: true, label: "Professional", showLabel: true, hideLeftSeparator: true, iconClass: "al al-protection-2", hideItem: false},
        { count: 0, showCount: true, label: "Enterprise", showLabel: true, hideLeftSeparator: true, iconClass: "al al-protection-3", hideItem: false}
    ]);
 */
import {Component, Input, Output, EventEmitter, OnInit, AfterViewInit} from '@angular/core';
import { AlProtectionBreakdownDescriptor, AlProtectionBreakdownGroupDescriptor } from '../../types';
import { FormControl } from '@angular/forms';
@Component({
  selector: 'al-protection-breakdown',
  templateUrl: './al-protection-breakdown.component.html',
  styleUrls: ['./al-protection-breakdown.component.scss']
})
export class AlProtectionBreakdownComponent implements OnInit, AfterViewInit{
  /**
   * Input search properties
   */
  private delayDebounce: number = 500;
  public searchControl = new FormControl();

  /**
   * Inputs
   */
  @Input() config: AlProtectionBreakdownGroupDescriptor[];
  @Input() title: string;
  @Input() textSearchPlaceHolder: string;
  @Input() fullScreen = false;
  /**
   * Outputs
   */
  @Output() onSearched: EventEmitter<any> = new EventEmitter();

  constructor() {
  }

  ngOnInit() {
  }

  /**
   * Emit the event search
   */
  ngAfterViewInit() {
    this.searchControl.valueChanges.pipe(
        debounceTime(this.delayDebounce)) // delay search
        .subscribe(newValue => {
            if (this.searchControl.valid) {
                this.onSearched.emit(this.searchControl.value);
            }
        });
    }
}
