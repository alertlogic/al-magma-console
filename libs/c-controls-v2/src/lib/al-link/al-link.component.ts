import { IconClass } from '../types/al-common.types';
import { Component, Input, OnInit } from '@angular/core';

/**
 * Provide either an internalRoute or externalUrl to link to.
 */
@Component({
  selector: 'ald-link',
  templateUrl: './al-link.component.html',
  styleUrls: ['./al-link.component.scss']
})
export class AlLinkComponent implements OnInit{

  /**
   * The link text.
   */
  @Input() label: string;

  /**
   * Internal link - uses angular routerLink.
   */
  @Input() internalRoute: string[];

  /**
   * External link - uses href and opens in new tab.
   */
  @Input() externalUrl: string;

  /**
   * Optionally open the link in a new tab. Applicable only to internalRoutes.
   */
  @Input() openInNewTab?: boolean;

  /**
   * The link style.
   */
  @Input() type?: 'default' | 'grayscale' = 'default';

  /**
   * Optionally add an underline to help highlight the link.
   */
  @Input() underline?: boolean;

  /**
   * Optionally give it an icon - use the icon name/class.
   */
  @Input() icon?: string;

  /**
   * Specify the icon class to use. Default is "material-icons.
   */
  @Input() iconClass?: IconClass = IconClass.materialIcons;

  /**
   * Optionally position the icon left or right; default is 'right'.
   */
  @Input() iconPos?: 'left' | 'right' = 'right';

  ngOnInit(): void {
    if (this.externalUrl && !this.icon) {
      this.icon = 'open_in_new';
    }
  }

}
