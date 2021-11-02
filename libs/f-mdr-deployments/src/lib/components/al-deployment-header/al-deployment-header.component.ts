/**
 * DeploymentHeaderComponent handles header component for deployment config
 *
 * @author Darwin Garcia <dgarcia@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2018
 */

import { Component, Input } from '@angular/core';
import { DeploymentButtonDescriptor, DeploymentHeaderDescriptor } from '../../types';

@Component({
    selector: 'al-deployment-header',
    templateUrl: './al-deployment-header.component.html',
    styleUrls: ['./al-deployment-header.component.scss']
})
export class AlDeploymentHeaderComponent {
    /**
     * Inputs
     */
    @Input() config: DeploymentHeaderDescriptor;

    constructor() {
    }

    doAction(buttonDef: DeploymentButtonDescriptor) {
        buttonDef.onClick();
    }
}
