# Al Action Snackbar

## Summary
The action snackbar appear on the bottom of the page (fixed) and it will provide actions available that can be taken. The actions are dinamycs and can be passed through an ```@Input```

<img src="https://algithub.pd.alertlogic.net/storage/user/735/files/6bb8a980-48eb-11ea-96da-ff2546d02f29"/>

Authors:
- Fabio Miranda (fmiranda@alertlogic.com)
- Andres David Echeverri Jimenez (andres.echeverri@alertlogic.com)

## Example Usage

    // ts
	public actionSnackbarButtons: AlActionSnackbarElement[] = [
		{
            event: "keep",
            icon: "check_circle",
            text: "KEEP",
            visible: true,
            type: 'button'
        },
        {
            event: "clear",
            icon: "cancel",
            text: "CLEAR ALL",
            visible: false,
            type: 'button'
        }
    ];
    public actionSnackbarVisible: boolean = false;
    public actionSnackbarText: string = 'Hello Word!';
    public actionSnackbarSelectedOption: AlActionSnackbarEvent = '';

    public actionSnackbarEvent(event: AlActionSnackbarEvent) {
        this.actionSnackbarSelectedOption = event;
    }
    
    // HTML
	<button (click)="actionSnackbarVisible = !actionSnackbarVisible" pButton label="Toggle"></button>
	<al-action-snackbar [text]="actionSnackbarText"
						[visible]="actionSnackbarVisible"
						[elements]="actionSnackbarButtons"
						(onElementPressed)="actionSnackbarEvent($event)">
	</al-action-snackbar>
	<p>Event: {{actionSnackbarSelectedOption}}</p>



## Inputs
 
| Name  | Type | Default | Description |
|-------|------|---------|-------------|
| text |string     |```''```         |Allows define the text.             |
|visible       |boolean      |```false```         |Allows to define whether al-action-snackbar is visible or not.             |
|elements       |AlActionSnackbarElement[]      |```undefined```        |Defined the list of elements to displayed.             |

## Outputs

  
| Name | Parameters | Description |
|--|--|--|
| onElementPressed | AlActionSnackbarEvent | Emit an event when user clicks on some element from the list. |

## Interface and types

    export type AlActionSnackbarEvent = string;
	export interface AlActionSnackbarElement {
		event: AlActionSnackbarEvent;
		icon?: string;
		visible: boolean;
		text: string;
        type: 'button' | 'input_switch';
	};
