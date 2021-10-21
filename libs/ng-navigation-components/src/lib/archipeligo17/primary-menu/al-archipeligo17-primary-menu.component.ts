import {
    AlActingAccountResolvedEvent,
    AlRoute,
} from '@al/core';
import {
    Component,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import { AlNavigationService } from '../../services/al-navigation.service';
import { AlNavigationInitializeToggle, AlNavigationNavHeaderMounted, AlNavigationRemoveToggle, AlNavigationTertiarySelected, ExperienceToggleDefinition } from '../../types';

@Component({
    selector: 'al-archipeligo17-primary-menu',
    templateUrl: './al-archipeligo17-primary-menu.component.html',
    styleUrls: [ './al-archipeligo17-primary-menu.component.scss' ]
})
export class AlArchipeligo17PrimaryMenuComponent implements OnInit, OnChanges
{
    @Input() navigationScheme:string = "archipeligo";
    @Input() menu:AlRoute       =   null;

    externalChild:boolean       =   false;

    viewReady:boolean           =   false;
    primaryItems:AlRoute[]      =   [];             //  Primary menu items
    secondaryItems:AlRoute[]    =   [];             //  Subnav menu items
    activeSecondaryItem:AlRoute =   null;           //  Active secondary item
    experienceToggle: ExperienceToggleDefinition | undefined = undefined;

    constructor( public router:Router, public alNavigation:AlNavigationService ) {
        this.alNavigation.events.attach( "AlActingAccountResolved", this.onActingAccountResolved );
        this.alNavigation.events.attach( "AlNavigationContextChanged", this.onContextChanged );
        this.alNavigation.events.attach( "AlNavigationSecondarySelected", this.onSetSecondaryMenu );
        this.alNavigation.events.attach(AlNavigationInitializeToggle, (event: AlNavigationInitializeToggle) => {
            this.experienceToggle = <ExperienceToggleDefinition> {
                label: event.label,
                tooltip: event.tooltip,
                checked: event.checked,
                callback: event.callback
            };
        });
        this.alNavigation.events.attach( AlNavigationRemoveToggle, (event: AlNavigationRemoveToggle) => {
            this.experienceToggle = undefined;
        });
    }

    ngOnInit() {
        this.alNavigation.events.trigger(new AlNavigationNavHeaderMounted());
    }

    ngOnChanges(changes:SimpleChanges) {
        if ( changes.hasOwnProperty( "menu" ) ) {
            this.onLocationChange();
        }
    }

    onActingAccountResolved = ( event:AlActingAccountResolvedEvent ) => {
        this.onContextChanged();
    }

    onContextChanged = () => {
        if ( ! this.menu ) {
            return;
        }
        this.primaryItems = this.menu.children;
        this.onLocationChange();
    }

    onClick( menuItem:AlRoute, $event: MouseEvent ) {
        if ( menuItem.properties.hasOwnProperty("target") && menuItem.properties.target === '_blank' ) {
            return true;
        }
        if ( $event ) {
            $event.stopPropagation();
            $event.preventDefault();
        }
        // open in a new tab if user using the combo: (CMD + click)  or (Ctrl + click) or (middle click)
        if ($event.metaKey || $event.ctrlKey || $event.button === 1) {
            return window.open(menuItem.href, '_blank');
        }
        menuItem.dispatch();
        return true;
    }

    onHoverStart( menuItem:AlRoute, $event:any ) {
        menuItem.refresh( true );
    }
    onLocationChange = () => {
        let activeSecondaryItem:AlRoute = null;
        if ( this.menu ) {
            this.primaryItems = this.menu.children;
            if ( ! this.externalChild ) {
                const activeChild = this.findActiveChild(this.primaryItems);
                if(activeChild && activeChild.getProperty("childOutlet") === "none") {
                    this.secondaryItems = [];
                } else {
                    this.secondaryItems = activeChild ? activeChild.children : [];
                }
                this.checkSecondaryMenu();
            }
            activeSecondaryItem = this.findActiveChild(this.secondaryItems);
        }
        if ( activeSecondaryItem !== this.activeSecondaryItem ) {
            if ( activeSecondaryItem ) {
                if ( activeSecondaryItem !== this.activeSecondaryItem ) {
                    if ( activeSecondaryItem.children.length > 0 ) {
                        const event = new AlNavigationTertiarySelected(activeSecondaryItem);
                        this.alNavigation.events.trigger(event);
                    } else {
                        let event = new AlNavigationTertiarySelected(null);
                        this.alNavigation.events.trigger(event);
                    }
                }
            } else {
                let event = new AlNavigationTertiarySelected(null);
                this.alNavigation.events.trigger(event);
            }
            this.activeSecondaryItem = activeSecondaryItem;
        }
        this.viewReady = true;
    }

    setMenuItemClasses( route:AlRoute ) {
        let classes = [ route.getProperty("css_class", "default" ) ];
        if ( route.activated ) {
            classes.push( 'active' );
        }
        if ( ! route.enabled ) {
            classes.push( "disabled" );
        }

        classes.push( route.definition.id ? route.definition.id.replace( /\:/g, "_" ) : route.caption.replace( /\s/g, "_" ) );
        route.setProperty( "consolidated_css_classes", classes.join(" " ) );
    }

    onSetSecondaryMenu = ( context:any ) => {
        if ( context.child ) {
            this.secondaryItems = context.child.children;
            this.externalChild = true;
        } else {
            this.secondaryItems = [];
            this.externalChild = false;
        }
        this.checkSecondaryMenu();
        this.onContextChanged();
    }

    /**
     * set menu item classes and returns the activated item or null
     */
    findActiveChild(items: AlRoute[]):AlRoute {
        let activeItem:AlRoute = null;
        items.forEach(item => {
            this.setMenuItemClasses(item);
            activeItem = item.activated ? item : activeItem;
        });
        return activeItem;
    }

    checkSecondaryMenu() {
        if (this.secondaryItems.length) {
            this.secondaryItems = !this.secondaryItems[0].parent.getProperty("childOutletOnly") ? this.secondaryItems : [];
        }
    }

}
