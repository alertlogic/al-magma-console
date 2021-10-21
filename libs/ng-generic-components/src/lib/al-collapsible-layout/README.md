# Al Collapsible Layout

## Summary
You will have the possibility to distribute the content of your page using two side panels, one on the left and one on the right. These panels are optional and have the ability to collapse to make more space for central content. If you don't want to use any panel, you can specify it in the component inputs.

Authors:
- Fabio Miranda (fmiranda@alertlogic.com)
- Juan Galarza (juan.galarza@alertlogic.com)

## Example Usage

    // ts
    public rightTooltipLabel:string = "";
	public leftTooltipLabel:string = "";
	public leftPanel:boolean = true;
	public rightPanel:boolean = true;

	constructor() {
		this.rightTooltipLabel = "Right panel";
		this.leftTooltipLabel = "Left panel";
	}
    
    // HTML
	<al-collapsible-layout
		[rightTooltipLabel]="rightTooltipLabel"
		[leftTooltipLabel]="leftTooltipLabel"
		[leftPanel]="leftPanel"
		[rightPanel]="rightPanel">
		<div left>
			<p>Left Panel</p>
		</div>
		<div center>
			<p>Center Panel</p>
		</div>
		<div right>
			<p>Right Panel</p>
		</div>
	</al-collapsible-layout>



## Inputs
 
| Name  | Type | Default | Description |
|-------|------|---------|-------------|
| rightTooltipLabel     |string     |''         |Allows define the tooltip label for the right panel button.|
| leftTooltipLabel     |string     |''         |Allows define the tooltip label for the left panel button.|
| leftPanel     |boolean     |true         |Allows define if you want to use the left panel.|
| rightPanel     |boolean     |true         |Allows define if you want to use the right panel.|

