/**
 * This is based on the AlIdentityIconComponent from @components/technical-debt, in turn based on the
 * NameColoredSquareComponent from dunkirk project, etc, etc.
 *
 * @author Cristhian Rendón <crendon@alertlogic.com>
 * @author Gisler Garces <ggarces@alertlogic.com>
 * @author McNielsen <knielsen@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2019
 */

import { Input, Component, OnChanges, SimpleChanges } from '@angular/core';

@Component({
    selector: 'al-identity-icon',
    templateUrl: './al-identity-icon.component.html',
    styleUrls: ['./al-identity-icon.component.scss']
})
export class AlIdentityIconComponent implements OnChanges
{
    /**
     * @property The full name of the entity
     */
    @Input() name:string;

    /**
     *  @property Indicates whether the icon should be circular instead of the rectangular default
     */
    @Input() circular:boolean = false;

    /**
     * @property If true, the full name will be included after the initial icon.
     */
    @Input() withLegend: boolean = false;

    /**
     * @property display mode; can be 'big' or 'small'
     */
    @Input() display:string = "big";

    public initials:string = "";
    public classes = 'identity-icon color1';
    private maxLengthInitials = 2;


    ngOnChanges( changes:SimpleChanges ) {
        if ( changes.hasOwnProperty("name") && this.name ) {
            let parts = this.name.split(" ");
            let classes = [ 'identity-icon', this.getColorClass( this.name ) ];
            this.initials = parts.map( part => part.trim().toUpperCase().charAt( 0 ) ).join("");
            if ( this.initials.length > this.maxLengthInitials ) {
                this.initials = this.initials.substring( 0, this.maxLengthInitials);
            }
            if ( this.circular ) {
                classes.push( "circular" );
            }
            this.classes = classes.join( " " );
        }
    }

    private getColorClass( name:string ):string {
        let value = name.trim().toLowerCase().charCodeAt( 0 );
        if ( value >= 97 && value <= 122 ) {
            return "color" + Math.floor( ( value - 97 ) / 2 + 1 ).toString();
        }
        return "color1";
    }
}
