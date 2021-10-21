/*
 * @author Stephen Jones   <stephen.jones@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2019
 */
import {
  Input,
  Component,
  OnInit
} from '@angular/core';

import { WidgetContentType, ZeroStateReason, ZeroState } from '../types';

@Component({
    selector: 'al-content-zero-data',
    templateUrl: './al-content-zero-data.component.html',
    styleUrls: ['./al-content-zero-data.component.scss']
})
export class AlZeroContentDataComponent implements OnInit {

  public title = '';
  public icon = '';
  public isError = false;
  public isGlyph = false;

  @Input() contentType: WidgetContentType;
  @Input() config: ZeroState;

  // For use in template
  public widgetContentType: typeof WidgetContentType = WidgetContentType;

  /*
   *
   */
  ngOnInit() {
    switch (this.config.reason) {
      case ZeroStateReason.API:
        this.title = this.config.title || 'Error: Unable to load data';
        this.icon = this.config.icon || 'ui-icon-error';
        this.isError = true;
        break;
      case ZeroStateReason.Entitlement:
        this.title = this.config.title || 'You do not have this entitlement.';
        this.icon = this.config.icon || 'ui-icon-block';
        this.isGlyph = this.config.icon && /^protection-[0-9]$/.test(this.icon) ? true : false;
        this.isError = true;
        break;
    }
  }
}

