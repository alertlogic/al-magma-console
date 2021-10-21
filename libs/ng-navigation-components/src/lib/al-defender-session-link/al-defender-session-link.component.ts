import {
    AlLocation,
    AlLocatorService,
    AlSession,
    AlStopwatch,
    AlSubscriptionGroup,
} from '@al/core';
import { Component } from '@angular/core';
import {
    DomSanitizer,
    SafeResourceUrl,
} from '@angular/platform-browser';
import { AlNavigationService } from '../services/al-navigation.service';

@Component({
    selector: 'al-defender-session-link',
    templateUrl: './al-defender-session-link.component.html',
    styleUrls: []
})
export class AlDefenderSessionLinkComponent
{
    public rawURL:string = null;
    public url: SafeResourceUrl = null;
    public setLink: AlStopwatch = null;

    protected subscriptions  =   new AlSubscriptionGroup( null );

    constructor(public sanitizer: DomSanitizer,  public alNavigation: AlNavigationService ) {
        this.setLink = AlStopwatch.later(this.setDefenderLink);
        this.subscriptions.manage(
            this.alNavigation.events.attach( 'AlNavigationContextChanged', this.onContextChanged ),
            AlSession.notifyStream.attach('AlActiveDatacenterChanged', this.onContextChanged)
        );
    }

    private setDefenderLink = (): void => {
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawURL);
    }

    private onContextChanged = (): void  => {
        if ( ! AlSession.isActive() ) {
            return;
        }
        const aimsAccessToken = AlSession.getToken();
        if ( ! aimsAccessToken ) {
            return;
        }
        const resource = `/defender_session_link.php?aims_token=${encodeURIComponent( aimsAccessToken )}`;
        const origin = AlLocatorService.resolveURL( AlLocation.LegacyUI, resource);
        if (this.rawURL !== origin) {
            this.rawURL = origin;
            this.setLink.again(1);
        }
    }
}

