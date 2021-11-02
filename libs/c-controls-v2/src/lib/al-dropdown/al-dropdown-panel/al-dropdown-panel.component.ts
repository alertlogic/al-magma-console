import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'ald-dropdown-panel',
  templateUrl: './al-dropdown-panel.component.html',
  styleUrls: ['./al-dropdown-panel.component.scss']
})
export class AlDropdownPanelComponent implements OnInit {

  @Input() width?: 'sm' | 'auto' | 'lg' = 'auto';

  constructor() { }

  ngOnInit(): void {
  }

}
