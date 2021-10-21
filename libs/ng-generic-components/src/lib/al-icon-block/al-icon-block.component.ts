/**
 *
 * An icon block component for Alert Logic
 *
 */

import { Component, Input, ViewEncapsulation } from '@angular/core';
import { TooltipConfig } from '../types';

@Component({
    selector: 'al-icon-block',
    templateUrl: './al-icon-block.component.html',
    styleUrls: ['./al-icon-block.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class AlIconBlockComponent {
    /**
     * The matIcon input for icon sets that use ligatures (i.e. Material Icons)
     */
    @Input() matIcon: string;
    /**
     * The icon class input for icon sets that use classes (i.e. FontAwesome)
     */
    @Input() iconClass: string;

    @Input() label: string;
    @Input() disabled?: boolean = false;
    @Input() tooltip:TooltipConfig = {
        showTooltip:false
    };

}
