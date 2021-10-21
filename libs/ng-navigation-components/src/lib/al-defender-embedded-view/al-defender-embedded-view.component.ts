import {
    AlActiveDatacenterChangedEvent,
    AlLocation,
    AlSession,
    AlStopwatch,
    AlSubscriptionGroup,
} from '@al/core';
import {
    AfterViewInit,
    Component,
    Input,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    OnChanges,
} from '@angular/core';
import {
    DomSanitizer,
    SafeResourceUrl,
} from '@angular/platform-browser';
import { AlNavigationService } from '../services/al-navigation.service';

@Component({
  selector: 'al-defender-embedded-view',
  templateUrl: './al-defender-embedded-view.component.html',
  encapsulation: ViewEncapsulation.None
})
export class AlDefenderEmbeddedViewComponent implements OnInit, OnChanges , AfterViewInit, OnDestroy {
    @ViewChild('iframe',{static:false}) iframe:any;

    @Input() public resourcePath:string;
    @Input() public height:string = "768";
    @Input() public width:string = "100%";

    public resourceUrl: SafeResourceUrl;

    public loading: boolean = true;

    protected subscriptions = new AlSubscriptionGroup();

    constructor( public navigation:AlNavigationService,
                 public sanitizer: DomSanitizer ) {
        this.subscriptions.manage(
            AlSession.notifyStream.attach( AlActiveDatacenterChangedEvent, this.onDatacenterChanged )
        );
    }

    /**
    *  Initialization lifecycle event.  Determine effective account and initial data load.
    */
    ngOnInit() {
        this.determineResourceUrl();
    }

    ngOnChanges(){
        this.determineResourceUrl();
    }

    ngAfterViewInit() {
        this.iframe.nativeElement.addEventListener('load', this.onLoad.bind(this));
        AlStopwatch.once( () => {
            this.determineResourceUrl();
        } );
    }

    ngOnDestroy() {
        this.subscriptions.cancelAll();
    }

    onLoad = () => {
        this.loading = false;
    }

    onDatacenterChanged = () => {
        this.determineResourceUrl();
    }

    protected determineResourceUrl() {
        const rawUrl = this.navigation.resolveURL( { locTypeId: AlLocation.LegacyUI, path: this.resourcePath },
                                                   { aims_token: AlSession.getToken() } );
        this.resourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl( rawUrl );
        console.log("Using embbeded URL [%s]", rawUrl );
    }
}
