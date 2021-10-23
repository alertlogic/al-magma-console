import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'ald-loading-spinner',
  templateUrl: './al-loading-spinner.component.html',
  styleUrls: ['./al-loading-spinner.component.scss']
})
export class AlLoadingSpinnerComponent implements OnInit{

  @Input() size: 'sm' | 'md' | 'lg' = 'lg';
  @Input() theme: 'default' | 'light' | 'dark' = 'default';

  strokeWidth: number;

  constructor() { }

  ngOnInit() {
    switch (this.size) {
      case 'sm':
        this.strokeWidth = 6;
        break;
      case 'md':
        this.strokeWidth = 5;
        break;
      case 'lg':
        this.strokeWidth = 4;
        break;
      default:
        this.strokeWidth = 4;
    }

  }

}
