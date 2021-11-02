/**
 * Deployment name
 * A block to show a deployment name
 * @author Mario Payan <mario.payan@alertlogic.com>
 */

import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { AlDeploymentName } from '../../types';

@Component({
    selector: 'al-deployment-name',
    templateUrl: './al-deployment-name.component.html',
    styleUrls: [ './al-deployment-name.component.scss' ],
    encapsulation:ViewEncapsulation.None
})

export class AlDeploymentNameComponent implements OnInit{

    @Input() data: AlDeploymentName = new AlDeploymentName;

    constructor(){}

    ngOnInit() {
        this.data.initialize();
    }
}
