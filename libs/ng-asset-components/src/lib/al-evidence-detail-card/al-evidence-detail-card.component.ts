import {
    Component,
    Input,
    OnInit,
    Output,
    EventEmitter,
} from '@angular/core';
import { Evidence } from '../types/exposures.type';

@Component({
    selector: 'al-evidence-detail-card',
    templateUrl: './al-evidence-detail-card.component.html',
    styleUrls: ['./al-evidence-detail-card.component.scss'],
})
export class AlEvidenceDetailCardComponent implements OnInit {
    @Input()
    public evidence: Evidence = {
        evidence: ""
    };

    @Input()
    public expanded: boolean = false;

    /**
    * Outputs
    */
    @Output() onExpand: EventEmitter<any> = new EventEmitter();

    ngOnInit() {
        // Empty
    }

    toggleEvidenceDetails($event:any) {
        $event.stopPropagation();
        this.onExpand.emit(this.evidence);
    }
}
