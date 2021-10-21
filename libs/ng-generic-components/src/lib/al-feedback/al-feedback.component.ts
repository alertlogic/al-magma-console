import { SelectItem } from 'primeng/api';
import { Component } from '@angular/core';

@Component({
    selector: 'al-feedback',
    templateUrl: './al-feedback.component.html',
    styleUrls: ['./al-feedback.component.scss']
})

export class AlFeedbackComponent {
    public feedbackReason: SelectItem;
    public reasons:SelectItem[] = [
        { label: 'Select a reason', value: null },
        { label: "Reason 1", value: 1 },
        { label: "Reason 2", value: 2 },
        { label: "Reason 3", value: 3 },
        { label: "Reason 4", value: 4 }
    ];
    public showFeedbackDialog: boolean = false;
    public feedbackText: string|null = null;
    public showFeedbackOption: boolean = false;

    public show(){
        this.showFeedbackOption = true;
    }

    public hide(){
        this.showFeedbackOption = false;
    }

    public toogleFeedbackDialog(): void {
        this.showFeedbackDialog = !this.showFeedbackDialog;
        this.resetInputs();
    }

    public isDisabledSubmit(): boolean {
        let disabled = true;
        if (this.feedbackText && this.feedbackText !== "" && this.feedbackReason) {
            disabled = false;
        }
        return disabled;
    }

    public submitFeedback(): void {
        this.toogleFeedbackDialog();
    }

    private resetInputs(): void {
        this.feedbackText = null;
        this.feedbackReason = <SelectItem>{};
    }

}
