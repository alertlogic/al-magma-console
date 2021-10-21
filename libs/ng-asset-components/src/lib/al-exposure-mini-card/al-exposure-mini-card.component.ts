import { TooltipConfig } from '@al/ng-generic-components';
/**
 * Component migrated from exposures app.
 */
import {
    Component,
    ChangeDetectionStrategy,
    EventEmitter,
    Input,
    Output,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';

@Component({
    selector: 'al-exposure-mini-card',
    templateUrl: './al-exposure-mini-card.component.html',
    styleUrls: ['./al-exposure-mini-card.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlExposureMiniCardComponent implements OnInit {

    /** Inputs */
    @Input() expanded: boolean = false;
    @Input() expandable: boolean = true;
    @Input() cardBackground:boolean = false;
    @Input() cardBorder:boolean = false;
    @Input() tooltip:TooltipConfig = {
        showTooltip:false
    };
    /**
    * Outputs
    */
    @Output() onExpand: EventEmitter<any> = new EventEmitter();

    ngOnInit() {
        // Empty
    }

    expandToggle(event:any): void {
        this.onExpand.emit(event);

        if( this.expandable === false ){
            return;
        }
        this.expanded = !this.expanded;
    }

}
