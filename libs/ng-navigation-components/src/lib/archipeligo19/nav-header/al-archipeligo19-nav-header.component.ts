import {
    AlRoute,
    AlSession,
    AlSessionEndedEvent,
    AlSessionStartedEvent,
    AlSubscriptionGroup
} from '@al/core';
import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    QueryList,
    SimpleChanges,
    ViewChildren
} from '@angular/core';
import { Menu } from 'primeng/menu';
import { AlNavigationService } from '../../services/al-navigation.service';
import { AlNavigationInitializeToggle, AlNavigationNavHeaderMounted, AlNavigationRemoveToggle, ExperienceToggleDefinition } from '../../types/navigation.types';

@Component({
    selector: 'al-archipeligo19-nav-header',
    templateUrl: './al-archipeligo19-nav-header.component.html',
    styleUrls: ['./al-archipeligo19-nav-header.component.scss']
})
export class AlArchipeligo19NavHeaderComponent implements OnInit, OnChanges, OnDestroy {

    @Input() menu: AlRoute = AlRoute.empty();
    @Input() userMenu: AlRoute = AlRoute.empty();
    @Input() breadcrumbs: AlRoute[] = [];
    @Input() headerActionsMenus: AlRoute[] = [];
    @ViewChildren('headerActionsItemMenus') headerActionsItemMenus:QueryList<Menu>;
    @Input() addendumToNavTitle: string;
    @Input() allowUnauthenticatedMenus:boolean = false;

    displayIconName: string = '';
    subscriptions: AlSubscriptionGroup = new AlSubscriptionGroup(null);
    authenticated: boolean = false;
    experienceToggle: ExperienceToggleDefinition | undefined = undefined;

    // TODO - Thinking instead we should have navigation component service, where we can emit toggle state and
    // listen to that in the al-sidenav,
    // Otherwise every app will need to handle this output and set the toggle boolean @input to the al-sidenav!!
    @Output() toggleButtonClick: EventEmitter<any> = new EventEmitter();

    constructor(public alNavigation: AlNavigationService) {
        this.subscriptions.manage([
            this.alNavigation.events.attach(AlNavigationInitializeToggle, (event: AlNavigationInitializeToggle) => {
                this.experienceToggle = <ExperienceToggleDefinition> {
                    label: event.label,
                    tooltip: event.tooltip,
                    checked: event.checked,
                    callback: event.callback,
                };
            }),
            this.alNavigation.events.attach(AlNavigationRemoveToggle, (event: AlNavigationRemoveToggle) => {
                this.experienceToggle = undefined;
            })
        ]);
    }

    ngOnInit() {
        this.authenticated = AlSession.isActive();
        this.subscriptions.manage([
            AlSession.notifyStream.attach(AlSessionStartedEvent, this.onSessionStart),
            AlSession.notifyStream.attach(AlSessionEndedEvent, this.onSessionEnd)
        ]);
        this.alNavigation.events.trigger(new AlNavigationNavHeaderMounted());
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.hasOwnProperty("breadcrumbs")) {
            this.inferIconFromBreadcrumbs(this.breadcrumbs || []);
        }
    }

    ngOnDestroy() {
        this.subscriptions.cancelAll();
    }

    onSessionStart = (event: AlSessionStartedEvent) => {
        this.authenticated = true;
    }

    onSessionEnd = (event: AlSessionEndedEvent) => {
        this.authenticated = false;
    }

    toggleClick() {
        this.toggleButtonClick.emit();
    }

    inferIconFromBreadcrumbs(breadcrumbs: AlRoute[]) {
        let breadcrumbIcon = '';
        breadcrumbs.forEach(breadcrumb => {
            breadcrumbIcon = breadcrumb.getProperty("iconClass", breadcrumbIcon);
        });
        this.displayIconName = breadcrumbIcon;
    }

    dispatch(route: AlRoute, $event: MouseEvent, hasSubmenu: boolean = false): void {
        const menuId: string = route.properties.menuId;
        // If the item does not has submenu: dispatch route directly
        // otherwise open the dropdown menu
        if (!hasSubmenu) {
            if ($event) {
                $event.preventDefault();
                $event.stopPropagation();
            }
            route.dispatch();
        } else {
            const findChilds = (item: Menu): boolean => {
                const childId: string = item.model[0].id.split('--')[0];// why model[0]? because all the childs will have the same parent, then the same id part [menuId--index]
                return menuId && menuId === childId;
            };
            const menu: Menu = this.headerActionsItemMenus.find(findChilds);
            if (menu) {
                // Open dropdown
                menu.toggle($event);
            }
        }
    }
}
