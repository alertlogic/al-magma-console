/**
 * AlScoreCountDescriptor show the scores with icons :D.
 * @author Cristhian Fuertes <cristhian.fuertes@alertlogic.com>
 * @author Fabio Miranda <fmiranda@alertlogic.com>
 * @author maryit sanchez <msanchez@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2018
 *
 * Sample about how to use it:
 * add in your ts component
    import {AlScoreCountDescriptor} from '../../design/types/al-score-count-descriptor.type';

 * add in your html
    <al-score-count [config]="alScoreCountConfig" [displayMode]="'big'" [name]="'Exposures'"></al-score-count>

 * where
    public alScoreCountConfig = AlScoreCountDescriptor.import({
        high: 10,
        medium: 0,
        low: 30,
        none: 20,
    });
 */
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AlScoreCountDescriptor } from '../types/al-score-count-descriptor.type';
@Component({
    selector: 'al-score-count',
    templateUrl: './al-score-count.component.html',
    styleUrls: ['./al-score-count.component.scss']
})
export class AlScoreCountComponent {

    @Input() config: AlScoreCountDescriptor;
    @Input() displayMode?: string = "big";
    @Input() name?: string = '';
    @Input() showCount?: boolean = false;
    @Input() limit4Levels?: boolean = false;
    @Input() selected?: string = '';
    @Input() threatiness:number = 0;
    @Output() onSelected: EventEmitter<string> = new EventEmitter();

    selectItem(severity: string) {
        this.onSelected.emit(severity);
    }
}
