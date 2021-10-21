import { Component } from '@angular/core';
import { AlConduitClient, AlSession, AlStopwatch, AlLocatorService, AlLocation } from '@al/core';
import {
    WelcomePageResource,
    WelcomePageManifest,
    WelcomePageState
} from './welcome.types';

@Component({
    selector: 'al-welcome-dialog',
    templateUrl: './al-welcome-dialog.component.html',
    styleUrls: ['./al-welcome-dialog.component.scss']
})
export class AlWelcomeDialogComponent {

    display: boolean                        = false;
    manifest:WelcomePageManifest;
    public title                            =   'Welcome';
    galleriaItems: WelcomePageResource[]    =   [];
    innovations: WelcomePageResource[]      =   [];
    videoTutorials: WelcomePageResource[]   =   [];
    hideDialog: boolean                     =   false;
    indexGalleria: number                   =   0;
    maxIndexGalleria: number                =   0;
    logoSourceName: string                  = "logo-horizontal-light.svg";
    logoUrl                                 = "";
    galleriaUrls: string[]                  = [];
    videosUrls: string[]                    = [];

    protected state:WelcomePageState = {
        sessionExpiration: AlSession.getTokenExpiry(),
        lastDisplayedVersion: 0,
        displayUpdatesOnly: false
    };
    protected conduit = new AlConduitClient();

    changeIndex(index: number) {
        this.indexGalleria = index;
    }

    openURL(url: string) {
        window.open(url, "_blank");
    }

    getURLThumbnail(urlImage: string): string {
        return 'url('+urlImage+')';
    }

    getFullUrlImage(imageUrl: string): string {
        const multimediaUrlPath: string = AlLocatorService.resolveURL(AlLocation.AccountsUI, "/assets/static/welcomePage/img/" );
        return multimediaUrlPath+imageUrl;
    }

    public async shouldDisplay( manifest:WelcomePageManifest ) {
        if ( this.display ) {
            //  Already displayed
            return false;
        }
        let state = await this.conduit.getGlobalSetting( `welcomePage` ) as WelcomePageState;
        if ( state ) {
            this.state = state;
        }
        this.hideDialog = this.state.displayUpdatesOnly;
        let currentTimestamp = Math.floor( new Date().getTime() / 1000 );
        if ( currentTimestamp < this.state.sessionExpiration ) {
            return false;
        }
        if ( this.state.displayUpdatesOnly && this.state.lastDisplayedVersion >= manifest.version ) {
            return false;
        }
        return true;
    }

    public startDisplay( manifest:WelcomePageManifest ) {
        this.manifest = manifest;
        this.logoUrl = this.getFullUrlImage(this.logoSourceName);
        this.title = manifest.title || "Welcome";
        this.galleriaUrls = [];
        this.videosUrls = [];
        if ( 'featured' in manifest.sections ) {
            this.galleriaItems = manifest.sections.featured.items.filter( item => {
                if (item.imageUrl) {
                    this.galleriaUrls.push(this.getURLThumbnail(this.getFullUrlImage(item.imageUrl)));
                }
                return item.visible;
            } );
        }

        if ( 'innovations' in manifest.sections ) {
            this.innovations = manifest.sections.innovations.items;
        }

        if ( 'videos' in manifest.sections ) {
            this.videoTutorials = manifest.sections.videos.items.filter( item => {
                if (item.imageUrl) {
                    this.videosUrls.push(this.getFullUrlImage(item.imageUrl));
                }
                return item.visible;
            } );
        }
        this.display = true;
        AlStopwatch.once( () => {
            this.state.sessionExpiration = AlSession.getTokenExpiry();
            this.state.lastDisplayedVersion = manifest.version;
            this.conduit.setGlobalSetting( `welcomePage`, this.state );
        }, 1000 );
    }

    public welcomeDisplayChanged( event:Event ) {
        this.state.displayUpdatesOnly = this.hideDialog;
        AlStopwatch.once( () => {
            this.conduit.setGlobalSetting( `welcomePage`, this.state );
        }, 1000 );
    }
}
