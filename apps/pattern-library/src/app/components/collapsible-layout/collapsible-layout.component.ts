import { Component } from '@angular/core';

@Component({
    selector: 'collapsible-layout',
    templateUrl: './collapsible-layout.component.html',
    styleUrls: ['./collapsible-layout.component.scss'],
})
export class CollapsibleLayoutComponent{ 
  
  // Common variables
  public rightTooltipLabel:string = "";
  public leftTooltipLabel:string = "";
  public leftPanel:boolean = true;
  public rightPanel:boolean = true;

  constructor() {
    this.rightTooltipLabel = "Right panel";
    this.leftTooltipLabel = "Left panel";
  }
}
