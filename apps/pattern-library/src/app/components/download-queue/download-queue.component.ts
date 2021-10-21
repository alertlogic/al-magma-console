import { Component, ViewChild } from '@angular/core';
import { AlDownloadQueueComponent } from '@al/ng-generic-components';
import { AlSearchClientV2 } from '@al/core';

@Component({
    selector: 'download-queue',
    templateUrl: './download-queue.component.html'
})

export class DownloadQueueComponent {

    @ViewChild(AlDownloadQueueComponent) download: AlDownloadQueueComponent = new AlDownloadQueueComponent();

    constructor() {
    }

    public async getResults(): Promise<void> {
        this.download.addSearch();
    }
}
