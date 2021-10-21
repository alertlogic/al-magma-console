import { ALClient } from '@al/core';
import { AlNavigationService } from '@al/ng-navigation-components';
import {
    Component,
    OnInit,
} from '@angular/core';
import { AppResourcesService } from '../../service/app-resources.service';

class AlIcon {
    constructor(public name:string, public colorPaths:string[]){}
}

@Component({
    selector: 'al-iconography',
    templateUrl: './icons.component.html',
    styleUrls: ['./icons.component.scss']
})

export class IconsComponent implements OnInit {
    iconDictionary: {[iconName:string]:AlIcon}  =   {};
    iconList:AlIcon[]                           =   [];
    selectedIcon: AlIcon;
    selectedIconDisplayed                       =   false;
    exampleIconMarkup:string;

    constructor( public resources:AppResourcesService,
                 public navigation:AlNavigationService ) {

    }

    ngOnInit() {
        this.getIconManifest();
    }

    public async getIconManifest() {

        let resourceURL = '/assets/alertlogic-icons.css';
        let css = await ALClient.get( { url: resourceURL, withCredentials: false } );

        let matcher = /\.(al\-[a-zA-Z0-9_\-]+)([^\{]*)\{([^\}]*)\}/gi;
        let colorPathMatcher = /[\s]*\.([a-zA-Z0-9\-]+).*/i;

        let match;
        while ( ( match = matcher.exec( css ) ) ) {
            let iconName = match[1];
            let extra = match[2];
            if ( ! this.iconDictionary.hasOwnProperty( iconName ) ) {
                this.iconDictionary[iconName] = new AlIcon( iconName, [] );
            }
            let icon = this.iconDictionary[iconName];
            if ( colorPathMatcher.test( extra ) ) {
                let pathMatcher = colorPathMatcher.exec( extra );
                icon.colorPaths.push( pathMatcher[1] );
            }
        }
        this.iconList = Object.values( this.iconDictionary )
                                .sort( ( a, b ) => a.name.localeCompare( b.name ) );

    }

    select(icon: AlIcon): void {
        this.selectedIcon = icon;
        this.exampleIconMarkup = this.createExampleString( icon );
        console.log("Example markup: ", this.exampleIconMarkup );
        this.selectedIconDisplayed = true;
    }

    createExampleString(glyph: AlIcon): string {
        if (!glyph) { return ''; }

        let exampleString = [`<i class='${glyph.name}'>`];
        glyph.colorPaths.forEach(path => {
            exampleString.push(`\t<span class='${glyph.name}'></span>`);
        });
        exampleString.push("</i>");

        // only join if there are sub parts to an icon
        return glyph.colorPaths.length === 0 ? exampleString.join('') : exampleString.join('\r\n');

    }

}

