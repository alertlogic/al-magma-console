import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AlLocatorService } from '@al/core';

@Component({
    selector: 'al-deployment-adr-info-tutorial',
    templateUrl: './deployment-adr-info-tutorial.component.html',
    styleUrls: ['./deployment-adr-info-tutorial.component.scss']
})
export class DeploymentAdrInfoTutorialComponent{

    public url: string = "";

    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
        localStorage.setItem('deploymentAdrInfoTutorial', 'done');
        this.url = AlLocatorService.resolveURL('cd17:accounts') + "/users/developer/#/";
    }
}
