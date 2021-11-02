import { Component, Input, OnInit } from '@angular/core';

export enum StackDirection {
  horizontal = 'horizontal',
  vertical = 'vertical'
}

enum StackDistribution {
  start = 'start',
  end = 'end',
  center = 'center',
  between = 'between',
  around = 'around',
  evenly = 'evenly'
}

enum StackAlignment {
  start = 'start',
  end = 'end',
  center = 'center',
  stretch = 'stretch'
}

@Component({
  selector: 'ald-stack',
  templateUrl: './al-stack.component.html',
  styleUrls: ['./al-stack.component.scss']
})
export class AlStackComponent implements OnInit {

  flexDirection: string;
  flexDistribution: string;
  flexAlignment: string;

  @Input() direction: StackDirection = StackDirection.horizontal;
  @Input() gap: number = 0;
  @Input() alignment: StackAlignment = StackAlignment.start;
  @Input() distribution: StackDistribution = StackDistribution.between;
  @Input() wrap: boolean = true;

  constructor() { }

  ngOnInit(): void {

    if (this.direction === StackDirection.horizontal) {
      this.flexDirection = 'u-flex-row';
    } else if (this.direction === StackDirection.vertical) {
      this.flexDirection = 'u-flex-col';
    }

    this.flexDistribution  = 'u-justify-' + (this.distribution || 'between');
    this.flexAlignment     = 'u-items-' + (this.alignment || 'start');

  }

}
