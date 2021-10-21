import { AlRoute } from '@al/core';
import {
    Component,
    Input,
    OnChanges,
    SimpleChanges,
} from '@angular/core';
import { AlNavigationService } from '../../services/al-navigation.service';

@Component({
    selector: 'al-archipeligo19-content-menu',
    templateUrl: './al-archipeligo19-content-menu.component.html',
    styleUrls: ['./al-archipeligo19-content-menu.component.scss']
})
export class AlArchipeligo19ContentMenuComponent implements OnChanges
{
    @Input() menu:AlRoute;
    // @Input() cursorItem:AlRoute;

    constructor( protected alNavigation:AlNavigationService ) {
    }

    ngOnChanges( changes:SimpleChanges ) {
        if ( "menu" in changes ) {
            //  Refresh!
            this.menu.refresh(true);
        }
    }

    dispatch( route:AlRoute, $event:Event ) {
        if ( $event ) {
            $event.preventDefault();
        }
        route.dispatch();
    }
}
