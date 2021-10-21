import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AlDefaultClient } from '@al/core';
import { AlViewHelperComponent } from '@al/ng-generic-components';

import { PhoenixTopologySnapshot } from '@al/assets-query';

import { AlEnvironmentTopologyComponent,
        ExampleConfigBehavior as Behaviors,
        ITopologyBehaviors } from '@al/ng-visualizations-components';



@Component({
    selector: 'topology-config',
    templateUrl: './topology-config.component.html',
    styleUrls: ['./topology-config.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class TopologyConfigComponent implements OnInit {

    @ViewChild('topologyView') topologyView!: AlEnvironmentTopologyComponent;

    @ViewChild(AlViewHelperComponent) viewHelper:AlViewHelperComponent;

    topology: PhoenixTopologySnapshot | null = null;
    behaviors: ITopologyBehaviors = new Behaviors();
    loading: boolean = true;

    ngOnInit(): void {
        this.load();
    }

    async load() {
        this.loading = true;
        try {
            let rawData = await AlDefaultClient.get( { url: "/assets/demo/topology-raw-data.json" } );
            this.topology = PhoenixTopologySnapshot.import( rawData );
            this.topologyView.setReloadGraph(true);
        } catch( e ) {
            this.viewHelper.setError( e );
        } finally {
            this.loading = false;
        }
    }

    onClickNode(_: any){
        alert(`You clicked me`);
    }

    onRenderComplete(msg: string) {
        if (msg === 'end') {
            this.loading = false
        }
    }

    onZoomChanged(_: any){
        console.log("Zoom changed");
    }
}
