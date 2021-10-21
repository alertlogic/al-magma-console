/**
 * AlInitialsComponent provides a icon-like initials component used as a convenient shorthand to represent
 * unique individuals or accounts.  It is based on the NameColoredSquareComponent from dunkirk project, originally written
 * by Gisler Garces for the user management functionality in ozone.
 *
 * @author Gisler Garces <ggarces@alertlogic.com>
 * @author Cristhian Rendón <crendon@alertlogic.com>
 * @author McNielsen <knielsen@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2018
 */
import { Input, Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
    selector: 'al-initials',
    templateUrl: './al-initials.component.html',
    styleUrls: ['./al-initials.component.scss']
})

export class AlInitialsComponent implements OnInit, OnChanges {
    /**
     *  @property entity The account being displayed in this tile.
     */
    @Input() name: string = 'John Doe';

    /**
     *  @property the subname, this is going to be shown bellow the initial name.
     */
    @Input() subname: string = '';

    /**
     *  @property in order to show the account letters or the user letters.
     */
    @Input() circular: boolean = false;

    /**
     *  @property Indicates whether or not the account is "selected" or not.
     */
    @Input() selected: boolean = false;

    /**
     *  @property Indicates whether or not the initial should render simple without checkboxes.
     */
    @Input() simple: boolean = false;

    /**
     *  @property Indicates whether or not the full name should be displayed alongside the icon as a label.
     */
    @Input() labelled: boolean = false;

    public letters: string = "";                         //  the initials calculated from the name @Input()
    public hovering: boolean = false;                    //  Is the mouse hovering over the control right now?
    public classes: { [className: string]: boolean } = {};   //  CSS properties for fun and profit


    /**
     * When the component inits use the account name to properly color the tile.
     */
    ngOnInit() {
        this.refresh(); //  Do it on load.
    }

    ngOnChanges(changes: SimpleChanges) {
        this.refresh(); //  Do it on changes
    }
    /**
     * Returns the reference of the clicked account.
     */
    onClick() {
        console.log('click fire');
        // this.onClicked.emit( this.account );
    }

    toggleSelection(){
        this.selected = !this.selected;
    }

    refresh() {
        this.letters = '';
        this.classes = {};
        let parts = this.name.split(" ");
        let colorClass = "color1";
        for (let i = 0; i < Math.min(2, parts.length); i++) {
            let character = parts[i].trim().toUpperCase().charAt(0);
            this.letters += character;
            if (i === 0 && character >= 'A' && character <= 'Z') {
                colorClass = "account-color-" + Math.floor((character.charCodeAt(0) - 65) / 2 + 1).toString(); /* [ "account-color-1"..."account-color-13" ] */
            }
        }
        this.classes["colored-square"] = true;
        this.classes["circular"] = this.circular;
        this.classes[colorClass] = true;
    }

    onHoverStart() {
        if (!this.simple) {
            this.hovering = true;
        }
    }

    onHoverEnd() {
        this.hovering = false;
    }
}
