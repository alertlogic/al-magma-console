import { AlRoute } from '@al/core';
import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    Renderer2,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { Sidebar } from 'primeng/sidebar';
import { AlManageExperienceService } from '../../services/al-manage-experience.service';
import { AlNavigationService } from '../../services/al-navigation.service';

@Component({
    selector: 'al-archipeligo19-sidenav',
    templateUrl: './al-archipeligo19-sidenav.component.html',
    styleUrls: ['./al-archipeligo19-sidenav.component.scss']
})
export class AlArchipeligo19SidenavComponent implements OnChanges {
    @Input() displayNav = false;    // See al-nav-header toggle button click handling, this should be based on value from a service (observable)
    @Input() menu:AlRoute = null;
    @Output() displayNavChange = new EventEmitter<boolean>();
    @Output() onHide = new EventEmitter<boolean>();
    @ViewChild("navSideBar", { static: false }) navSideBar!: Sidebar;

    documentEscapeListener: Function;

    constructor( protected alNavigation:AlNavigationService,
                 protected alManageExperience: AlManageExperienceService,
                 protected renderer:Renderer2 ) {
    }

    ngOnChanges( changes:SimpleChanges ) {
        if ( changes.hasOwnProperty( "menu" ) ) {
            this.expandActivatedItems();
        }
        if ( changes.hasOwnProperty( "displayNav" ) ) {
          const display = changes['displayNav'];
          if(!display.firstChange && !display.currentValue) {
            this.destroyMask();
          }
      }
    }

    ngAfterViewInit() {
        this.bindDocumentEscapeListener();
    }

    dispatch( route: AlRoute, $event: MouseEvent, closeNav: boolean = false ) {
        if ( $event ) {
            $event.preventDefault();
        }
        // open in a new tab if user using the combo: (CMD + click)  or (Ctrl + click) or (middle click)
        if ($event.metaKey || $event.ctrlKey || $event.button === 1) {
          return window.open(route.href, '_blank');
        }
        route.dispatch();
        if( !route.children || route.parent.caption !== "primary" || closeNav || route.caption === 'Dashboards' ){
            this.displayNav = false;
            this.destroyMask();
            this.displayNavChange.emit( false );
        }
        return true;
    }

    dispatchParent( route: AlRoute, $event: MouseEvent ) {
        if ( $event ) {
            $event.preventDefault();
        }

        let visibleChildren = route.children.reduce<boolean>( ( alpha, child ) => alpha || child.visible, false );
        if ( visibleChildren && route.caption !== "Dashboards" ) {
            if(!route.getProperty( 'expanded', false )) {
                // Expose children
                route.setProperty( 'expanded', true );
            } else {
                // Unexposed children
                route.setProperty( 'expanded', false );
            }
        } else {
            //  Children already exposed, just dispatch!
            this.dispatch( route, $event );
        }
    }

    expandActivatedItems() {
        if ( ! this.menu ) {
            return;
        }
        const expander = ( route:AlRoute ) => {
            if ( route.activated ) {
                route.setProperty("expanded", true );
                route.children.forEach( expander );
            }
        };

        expander( this.menu );
    }

    bindDocumentEscapeListener() {
      this.documentEscapeListener = this.renderer.listen('document', 'keydown', (event) => {
        if (event.which === 27 && this.displayNav ) {
          this.displayNav = false;
          this.displayNavChange.emit( false );
        }
      });
    }

    hideSideBar(){
        this.onHide.emit(true);
    }

    destroyMask() {
      if(this.navSideBar.mask) {
        this.navSideBar.destroyModal();
      }
    }

}
