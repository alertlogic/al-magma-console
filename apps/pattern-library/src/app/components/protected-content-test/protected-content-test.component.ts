import { AlGlobalizer } from '@al/core';
import {
    AlContentUnavailable,
    AlProtectedContentExComponent,
} from '@al/ng-navigation-components';
import {
    ChangeDetectorRef,
    Component,
    NgZone,
    ViewChild,
} from '@angular/core';

@Component({
    selector: 'app-protected-content-test',
    templateUrl: './protected-content-test.component.html',
    styleUrls: ['./protected-content-test.component.scss']
})
export class ProtectedContentTestComponent {

    public entitlements:string[] = null;
    public primaryEntitlements:string[] = null;
    public environments:string[] = null;
    public query:string = null;
    public conditionsJson:string = '';

    @ViewChild( AlProtectedContentExComponent, {static:false} ) protectedContent:AlProtectedContentExComponent;

    constructor( public changeDetector:ChangeDetectorRef, public zone:NgZone ) {
        AlGlobalizer.expose( 'protectedContent', {
            limit: ( property:any, value:any ) => {
                this.zone.run( () => {
                    ( this as any )[property] = value;
                    this.changeDetector.detectChanges();
                    this.conditionsJson = JSON.stringify( this.protectedContent.conditions, null, 4 );
                } );
            },
            reset: () => {
                this.zone.run( () => {
                    this.entitlements = null;
                    this.primaryEntitlements = null;
                    this.environments = null;
                    this.query = null;
                    this.changeDetector.detectChanges();
                } );
            }
        } );
    }

    public setEntitlementCondition( e:string|string[]|null ) {
        this.entitlements = typeof( e ) === 'string' ? [ e ] : e;
    }

    public contentShown() {
        console.log("Content is being shown!" );
    }

    public contentHidden() {
        console.log("Content is being hidden!" );
    }

    public contentUnavailable( event:AlContentUnavailable ) {
        this.conditionsJson = JSON.stringify( event.conditions, null, 4 );
        console.log(`Content has been disallowed!`, event.conditions );
    }
}
