import { TooltipConfig } from '@al/ng-generic-components';
import { Component, Input } from '@angular/core';
import { IconBase, IconState } from '../../types/icons.types';

@Component({
    selector: 'al-detail-header',
    templateUrl: './al-detail-header.component.html',
    styleUrls: ['./al-detail-header.component.scss']
})
export class AlDetailHeaderComponent {

    @Input()
    public icon: IconBase; // IconSeverity
    @Input()
    public titles: { upperTitle: string, mainTitle: string, lowerTitle?: string };
    @Input()
    public actions: Array<{ icon: IconState, callback: Function, disable?: boolean, tooltip?: TooltipConfig }> = [];

    constructor() { }

}
