/**
 * al-fieldset
 *
 * @author Rob Parker <robert.parker@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2021
 *
 */

import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'al2-fieldset',
  templateUrl: './al-fieldset.component.html'
})
export class AlFieldsetComponent implements OnInit {

  @Input() legend?:           string;
  @Input() legendLarge?:      boolean;
  @Input() verticalSpace?:    boolean = true;
  @Input() hint?:             string;
  @Input() tip?:              string;

  constructor() { }

  ngOnInit(): void {
  }

}
