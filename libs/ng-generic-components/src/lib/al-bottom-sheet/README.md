# Al Bottom Sheet

## Summary
The bottom sheet are panels that contain supplementary content that are anchored to the bottom of the screen. This version is coming with a default header template that can be disabled.

<img src="https://algithub.pd.alertlogic.net/storage/user/735/files/43aa9880-40ea-11ea-9c77-900181bf07a0"/>

Authors:
- Andres David Echeverri Jimenez (andres.echeverri@alertlogic.com)

## Example Usage

    // ts
    headerOptions: AlBottomSheetHeaderOptions  = {
	    icon:  'call_merge',
	    title:  'Create Correlation Rule',
		collapsibleFromTitle: true,
	    primaryAction: {
		    text: 'My Title',
		    disabled:  true,
	    },
	    secondaryAction:{
		    text:  'Cancel',
		    disabled:  false
	    }
    };

	@ViewChild(AlBottomSheetComponent) alBottomSheet: AlBottomSheetComponent;
   
   	public save(){
   		console.log('onPrimary');
   	}
   
    public cancel() {
    	console.log('onSecondary');
    	this.alBottomSheet.hide();
    }

	public open() {
		console.log('onTertiary');
		this.alBottomSheet.open();
	}
    
	public toggle() {
		this.alBottomSheet.toggle();
	}
    
    // HTML
	<button (click)="toggle()" pButton label="Open"></button>
	<al-bottom-sheet
		[headerOptions]="headerOptions"
		(onPrimaryAction)="save()"
		(onSecondaryAction)="cancel()"
		(onTertiaryAction)="toggle()">
		<!-- Content Projection -->
		<h1>Hello Word!</h1>
	</al-bottom-sheet>



## Inputs
 
| Name  | Type | Default | Description |
|-------|------|---------|-------------|
| width |string     |'95%'         |Allows define the width of the al-bottom-sheet.<br> The values can be in px, %, vh, rem etc...             |
|heightActive       |string      |'67px'         |Allows to set the heigth of the sidebar when the sidebar is collapse. <br>The values can be in px, %, vh, rem etc…             |
|heightFullScreen       |string      |'95vh'         |Allows to set the heigth of the sidebar when the sidebar is open.<br>The values can be in px, %, vh, rem etc...              |
|headerOptions       |AlBottomSheetHeaderOptions      |undefined         |Allows establish options for header (default template).<br>If is null or undefined the header will not be displayed              |
## Outputs

  
| Name | Parameters | Description |
|--|--|--|
| onPrimaryAction | null | Emit an event when user clicks on Primary buttom of header. |
| onSecondaryAction | null | Emit an event when user clicks on Secondary buttom of header. |
| onTertiaryAction | null | Emit an event when user clicks on Tertiary buttom of header. |

## Interface

    export  interface  AlBottomSheetHeaderOptions {
	    icon?:  string; // for Material Icons
		classIcon?:string; // for Class Icons i.e. al al-assets, al-applications etc.
	    iconStyle?: {[key:  string]:  string};
	    title?:  string;
	    titleStyle?: {[key:  string]:  string};
		collapsibleFromTitle?: boolean // allow collapse the bottom sheet from title
	    primaryAction?: { // primary buttom
		    text?:  string,
		    disabled:  boolean
	    },
	    secondaryAction?: { // secondary buttom
		    text:  string,
		    disabled:  boolean,
	    },
	    tertiaryAction?: { // tertiary buttom
		    text:  string
		    disabled:  boolean,
	    }
    }

## Notes
For the primary, secondary or tertiary buttons to appear, you must initialize the primaryAction, secondaryAction or tertiaryAction properties of the AlBottomSheetHeaderOptions interface.

