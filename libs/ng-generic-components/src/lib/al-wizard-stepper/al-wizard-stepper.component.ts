import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AlBottomSheetHeaderOptions } from '../al-bottom-sheet/al-bottom-sheet-header-options.types';
import { WizardStep } from './wizard.types';

@Component({
  selector: 'al-wizard-stepper',
  templateUrl: './al-wizard-stepper.component.html',
  styleUrls: ['./al-wizard-stepper.component.scss']
})
export class AlWizardStepperComponent {

  @Input() headerOptions: AlBottomSheetHeaderOptions;
  @Input() loading: boolean = false;
  @Output() onStepSelected: EventEmitter<WizardStep> = new EventEmitter<WizardStep>();
  @Output() onCancelButton: EventEmitter<void> = new EventEmitter<void>();

  steps: WizardStep[] = [];
  stepIndex: number = 0;

  addStep(step: WizardStep) {
    if (this.steps.length === 0) {
      step.active = true;
      step.complete = false;
    }
    this.steps.push(step);
  }

  stepForward(): void {
    if (this.stepIndex < this.steps.length-1) {
      this.steps[this.stepIndex].complete = true;
      const nextStep = this.steps[this.stepIndex+1];
      this.selectStep(nextStep);
    }
  }

  stepBack(): void {
    if (this.stepIndex > 0) {
      this.selectStep(this.steps[this.stepIndex-1]);
    }
  }

  selectStep(step: WizardStep): void {
    this.steps.forEach(step => step.active = false);
    step.active = true;
    this.stepIndex = this.steps.findIndex(step => step.active);
    this.onStepSelected.emit(step);
  }

  onJumpStep(step: WizardStep): void {
    if (!step.active && step.complete) {
      this.selectStep(step);
    }
  }

  reset(): void {
    this.stepIndex = 0;
    this.steps.forEach((step, index) => {
      step.active = index === 0;
      step.complete = false;
    });
  }

}
