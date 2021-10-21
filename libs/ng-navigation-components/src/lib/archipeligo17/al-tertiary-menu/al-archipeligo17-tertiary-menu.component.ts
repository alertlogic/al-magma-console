import { AlRoute } from '@al/core';
import {
    Component,
    Input,
    OnChanges,
    SimpleChanges,
    TemplateRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AlNavigationService } from '../../services/al-navigation.service';

@Component({
    selector: 'al-archipeligo17-tertiary-menu',
    templateUrl: './al-archipeligo17-tertiary-menu.component.html',
    styleUrls: [ './al-archipeligo17-tertiary-menu.component.scss' ]
})

export class AlArchipeligo17TertiaryMenuComponent implements OnChanges
{
    @Input()
    public visible:boolean      =   true;

    @Input()
    menu:AlRoute                =   null;

    @Input()
    contentRef:TemplateRef<any> =   null;

    @Input()
    renderCustomSidenav:boolean =   false;

    @Input()
    showQuaternaryMenu:boolean  =   true;

    public activeTabs:AlRoute   =   null;
    sidenavOpen:boolean         =   false;
    stateChanges: Subscription  =   null;

    constructor(public router:Router,
                public alNavigation:AlNavigationService) {

    }

    ngOnChanges( changes:SimpleChanges ) {
        this.activeTabs = null;
        if ( changes.hasOwnProperty( "menu" ) || changes.hasOwnProperty( "contentRef" ) || changes.hasOwnProperty( "renderCustomSidenav" ) ) {
            this.onMenuChanged();
        }
    }

    onMenuChanged = () => {
        if ( ( this.menu && this.menu.children.length > 0 ) || this.renderCustomSidenav ) {
            this.sidenavOpen = true;
            this.onLocationChange();
        } else {
            this.sidenavOpen = false;
        }
    }

    onClick( menuItem:AlRoute, $event:any ) {
        if ( $event ) {
            $event.stopPropagation();
            $event.preventDefault();
        }
        menuItem.dispatch();
        setTimeout(()=>{
            this.onMenuChanged();
        },500);
    }

    onHoverStart( menuItem:AlRoute, $event:any ) {
        menuItem.refresh( true );
    }

    setMenuItemClasses( route:AlRoute, hasCuartoTab = false ) {
        let classes = [ route.getProperty("css_class", "default" ) ];
        if ( route.activated ) {
            classes.push( 'active' );
        }
        if ( ! route.activated ) {
            classes.push( "disabled" );
        }
        if ( hasCuartoTab ) {
            classes.push( "cuarto-tab" );
        }

        classes.push( route.definition.id ? route.definition.id.replace( /\:/g, "_" ) : route.caption.replace( /\s/g, "_" ) );
        route.setProperty( "consolidated_css_classes", classes.join(" " ) );
    }

    onLocationChange = () => {
        this.activeTabs = null;
        this.checkMenu();
        if ( this.menu ) {
            for ( let i = 0; i < this.menu.children.length; i++ ) {
                this.setMenuItemClasses( this.menu.children[i]);
                if ( this.menu.children[i].activated ) {
                    this.activeTabs = this.menu.children[i];
                    for ( let j = 0; j < this.activeTabs.children.length; j++ ) {
                        this.setMenuItemClasses( this.activeTabs.children[j] , true);
                    }
                }
            }
        }
    }

    checkMenu() {
        if (this.menu) {
            this.menu = !this.menu.getProperty("childOutletOnly") ? this.menu : null;
        }
    }
}
