/*
 * Dashboard Layout Container Component
 *
 * @author Stephen Jones <stephen.jones@alertlogic.com> & Meggy C
 * @copyright Alert Logic, 2019
 *
 */
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Widget, WidgetContentType } from '../types';

@Component({
  selector: 'al-dashboard-layout',
  templateUrl: './al-dashboard-layout.component.html',
  styleUrls: ['./al-dashboard-layout.component.scss']
})

export class AlDashboardLayoutComponent implements OnInit {

  // For use in template
  public contentType: typeof WidgetContentType = WidgetContentType;
  public poorGridSupport: boolean = false;

  // Inputs
  @Input() isLoading = false;
  @Input() config: Widget[];
  @Input() layoutFormat: string;

  // Outputs
  @Output() resizeStart: EventEmitter<any> = new EventEmitter();
  @Output() resizeEnd: EventEmitter<any> = new EventEmitter();

  private isResizing = false;
  private timeoutHnd:number;

  /*
   *
   */
  ngOnInit() {
    window.addEventListener('resize', () => {
      this.resize();
    });
    if (!this.supportsGrid()) {
      this.poorGridSupport = true;
    }
  }

  /*
   *
   */
  public hasActions = (config: Widget): Boolean => {
    return config.hasOwnProperty('actions') && Object.keys(config.actions).length > 0;
  }

  /*
   *
   */
  public ignoreFooter = (config: Widget): Boolean => {
    if (config.content && config.content.options) {
      return config.content.options.ignoreFooter ? true : false;
    }
    return false;
  }

  /*
   *
   */
  private supportsGrid = (): boolean => {
    return typeof document.createElement('div').style.grid === 'string';
  }

  /*
   *
   */
  private resize = (): void => {
    if (!this.isResizing) {
      this.isResizing = true;
      this.resizeStart.emit();
    } else {
      clearTimeout(this.timeoutHnd);
    }

    this.timeoutHnd = window.setTimeout(() => {
      this.isResizing = false;
      this.resizeEnd.emit();
    }, 1000);
  }

}

