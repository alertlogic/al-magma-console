import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'ald-fieldset',
  templateUrl: './al-fieldset.component.html',
  styleUrls: ['./al-fieldset.component.scss']
})
export class AlFieldsetComponent implements OnInit {

  @Input() legend?: string;
  @Input() legendLarge?: boolean;
  @Input() verticalSpace ? = true;
  @Input() hint?: string;
  @Input() tip?: string;

  constructor() { }

  ngOnInit(): void {
  }

}
