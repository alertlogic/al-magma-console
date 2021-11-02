import { AldStepComponent } from './ald-step/ald-step.component';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';

@Component({
  selector: 'ald-bottom-sheet',
  templateUrl: './ald-bottom-sheet.component.html',
  styleUrls: ['./ald-bottom-sheet.component.scss']
})
export class AldBottomSheetComponent {

  @Input() header?: string                   = 'Header';
  @Input() primaryActionButton?: string|boolean     = 'Save';
  @Input() primaryActionDoesClose?: boolean  = true;
  @Input() closeButton?: string|boolean      = 'Cancel';
  @Input() disablePrimaryAction?: boolean    = false;
  @Input() bgGray: boolean;

  @Input() icon?: string = 'hot_tub';
  @Input() iconClass?: string = 'material-icons';

  // Wizardy Stuff
  @Input() isWizardStepper: boolean;
  @Output() onStepSelected: EventEmitter<AldStepComponent> = new EventEmitter<AldStepComponent>();
  steps: AldStepComponent[] = [];
  stepIndex: number = 0;

  @Output() didClosePanel: EventEmitter<void> = new EventEmitter();
  @Output() didPrimaryAction: EventEmitter<void> = new EventEmitter();

  isOpen = false;
  
  public open() {
    this.isOpen = true;
  }

  /**
   * This will close the bottomsheet.
   * Emits the didClosePanel event.
   */
  public close() {
    this.didClosePanel.emit();
    this.isOpen = false;
  }

  /**
   * This will close the bottomsheet if the primary action is set to close (primaryActionDoesClose (true by default)).
   * Emits the didPrimaryAction event.
   */
  public primaryAction() {
    this.didPrimaryAction.emit();
    if (this.primaryActionDoesClose) {
      this.isOpen = false;
    }
  }

  /**
   * Used when constructing the stepper to add the AldStepCompontent to the steps
   * @param step 
   */
  public addStep(step: AldStepComponent) {
    if (this.steps.length === 0) {
      step.active = true;
      step.complete = true;
    }
    this.steps.push(step);
  }
  
  /**
   * Steps forward through the steps
   */
  public stepForward(): void {
    if (this.stepIndex < this.steps.length-1) {
      const nextStep = this.steps[this.stepIndex+1];
      nextStep.complete = true;
      this.selectStep(nextStep);
    } else {
      this.primaryAction();
    }
  }
  
  /**
   * Steps back through the steps
   */
  public stepBack(): void {
    if (this.stepIndex > 0) {
      this.selectStep(this.steps[this.stepIndex-1]);
    } else {
      this.close();
    }
  }
  
  /**
   * Select the step to show (sets the step.active to true).
   * @param step 
   */
  public selectStep(step: AldStepComponent): void {
    if (step.complete) {
      this.steps.forEach(step => {
        step.active = false;
      });
      step.active = true;
      this.onStepSelected.emit(step);
      this.stepIndex = this.steps.findIndex(step => step.active);
    }
  }

  /**
   * Resets the steps (marks them uncomplete).
   */
  public reset(): void {
    this.steps.forEach((step, index) => {
      step.active = index === 0;
      step.complete = index === 0;
    });
  }

}