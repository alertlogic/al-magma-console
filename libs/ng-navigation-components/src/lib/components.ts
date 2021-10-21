/**
 * Archipeligo 17/"CIE-Plus" Navigation Components
 */
import { AlArchipeligo17PrimaryMenuComponent } from './archipeligo17/primary-menu/al-archipeligo17-primary-menu.component';
import { AlArchipeligo17UserMenuComponent } from './archipeligo17/user-menu/al-archipeligo17-user-menu.component';
import { AlArchipeligo17AccountSelectorComponent } from './archipeligo17/account-selector/al-archipeligo17-account-selector.component';
import { AlArchipeligo17HeaderComponent } from './archipeligo17/header/al-archipeligo17-header.component';
import { AlArchipeligo17TertiaryMenuComponent } from './archipeligo17/al-tertiary-menu/al-archipeligo17-tertiary-menu.component';

/**
 * Archipeligo 19/"SIEMless" Navigation Components
 */
import { AlArchipeligo19AppHeaderComponent } from './archipeligo19/header/al-archipeligo19-app-header.component';
import { AlArchipeligo19ContentMenuComponent } from './archipeligo19/content-menu/al-archipeligo19-content-menu.component';
import { AlArchipeligo19NavHeaderComponent } from './archipeligo19/nav-header/al-archipeligo19-nav-header.component';
import { AlArchipeligo19SidenavComponent } from './archipeligo19/sidenav/al-archipeligo19-sidenav.component';

/**
 * Utility Components
 */
import { AlIntegratedAuthenticationComponent } from './al-integrated-authentication/al-integrated-authentication.component';
import { AlDefenderEmbeddedViewComponent } from './al-defender-embedded-view/al-defender-embedded-view.component';
import { AlDefenderSessionLinkComponent  } from './al-defender-session-link/al-defender-session-link.component';
import { AlNavigationFrameComponent } from './al-navigation-frame/al-navigation-frame.component';
import { AlNavigationOverlaysComponent } from './al-navigation-overlays/al-navigation-overlays.component';
import { AlProtectedContentComponent } from './al-protected-content/al-protected-content.component';
import { AlProtectedContentExComponent } from './al-protected-content-ex/al-protected-content-ex.component';

import { AlNavigationCustomSidenav } from './directives/al-navigation-custom-sidenav.directive';
import { AlAddendumToNavTitle } from './directives/al-addendum-navtitle.directive';
import { AlCustomTitleDirective } from './directives/al-custom-title.directive';
import { TransformToMenu } from './pipes/transformToMenu.pipe';


const NAVIGATION_COMPONENTS = [
    AlArchipeligo17PrimaryMenuComponent,
    AlArchipeligo17UserMenuComponent,
    AlArchipeligo17AccountSelectorComponent,
    AlArchipeligo17HeaderComponent,
    AlArchipeligo17TertiaryMenuComponent,

    AlArchipeligo19AppHeaderComponent,
    AlArchipeligo19ContentMenuComponent,
    AlArchipeligo19NavHeaderComponent,
    AlArchipeligo19SidenavComponent,

    AlIntegratedAuthenticationComponent,
    AlDefenderEmbeddedViewComponent,
    AlDefenderSessionLinkComponent,
    AlProtectedContentComponent,
    AlProtectedContentExComponent,
    AlNavigationFrameComponent,
    AlNavigationOverlaysComponent,
    AlNavigationCustomSidenav,
    AlAddendumToNavTitle,
    AlIntegratedAuthenticationComponent,
    AlCustomTitleDirective,
];

export {
    NAVIGATION_COMPONENTS,
    AlArchipeligo17PrimaryMenuComponent,
    AlArchipeligo17UserMenuComponent,
    AlArchipeligo17AccountSelectorComponent,
    AlArchipeligo17HeaderComponent,
    AlArchipeligo17TertiaryMenuComponent,
    AlArchipeligo19AppHeaderComponent,
    AlArchipeligo19ContentMenuComponent,
    AlArchipeligo19NavHeaderComponent,
    AlArchipeligo19SidenavComponent,
    AlIntegratedAuthenticationComponent,
    AlDefenderEmbeddedViewComponent,
    AlDefenderSessionLinkComponent,
    AlProtectedContentComponent,
    AlProtectedContentExComponent,
    AlNavigationFrameComponent,
    AlNavigationOverlaysComponent,
    AlNavigationCustomSidenav,
    AlAddendumToNavTitle,
    AlCustomTitleDirective,
    TransformToMenu,
};
