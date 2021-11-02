import { AldBottomSheetComponent } from '../ald-bottom-sheet.component';
import { Component, Input, Optional } from "@angular/core";

@Component({
    selector: 'ald-step',
    templateUrl: './ald-step.component.html',
    styleUrls: ['./ald-step.component.scss']
})
export class AldStepComponent extends AldBottomSheetComponent {
    
    @Input() stepTitle: string = '';
    complete: boolean;
    active: boolean;

    constructor(
        @Optional() wizard: AldBottomSheetComponent,
    ) {
        super();
        wizard.addStep(this);
    }

}