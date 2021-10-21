/**
 * Zero state
 *
 * @author Maryit Sanchez <msanchez@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2017
 *
 * Sample about how to use it
 * <al-zero-state>
        <span zero-state-title>Primary text</span>
        <span zero-state-description>Secondary text for a zero-state condition goes here.</span>
        <i zero-state-icon class="material-icons">info</i>
    </al-zero-state>
 */
import { Component, Input } from '@angular/core';

@Component({
    selector: 'al-zero-state',
    templateUrl: './al-zero-state.component.html',
    styleUrls: ['./al-zero-state.component.scss']
})
export class AlZeroStateComponent {
    @Input() flavor:string = "default";
}
