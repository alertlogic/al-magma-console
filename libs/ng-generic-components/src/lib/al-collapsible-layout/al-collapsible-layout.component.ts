import { Component, Input, ViewEncapsulation, OnInit } from '@angular/core';

@Component({
    selector: 'al-collapsible-layout',
    templateUrl: './al-collapsible-layout.component.html',
    styleUrls: ['./al-collapsible-layout.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AlCollapsibleLayoutComponent implements OnInit{
  // Inputs
  @Input() leftPanel:boolean = true;
  @Input() rightPanel:boolean = true;
  @Input() leftTooltipLabel:string = "";
  @Input() rightTooltipLabel:string = "";

  // Common variables
  public showLeft:boolean = true;
  public showRight:boolean = true;
  public leftTooltip:string = "";
  public rightTooltip:string = "";

  ngOnInit(): void {
    this.leftTooltip = `Hide ${this.leftTooltipLabel}`;
    this.rightTooltip = `Hide ${this.rightTooltipLabel}`;
  }

  public toogleLeft() {
      this.showLeft = !this.showLeft;
      this.leftTooltip = this.showLeft ? `Hide ${this.leftTooltipLabel}` : `Show ${this.leftTooltipLabel}`;
  }

  public toogleRight() {
      this.showRight = !this.showRight;
      this.rightTooltip = this.showRight ? `Hide ${this.rightTooltipLabel}` : `Show ${this.rightTooltipLabel}`;
  }
}
