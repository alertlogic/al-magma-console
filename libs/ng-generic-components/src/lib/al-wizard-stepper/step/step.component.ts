import { Component, Optional, Input } from '@angular/core';
import { AlWizardStepperComponent } from '../al-wizard-stepper.component';
import { WizardStep } from '../wizard.types';

@Component({
  selector: 'al-step',
  templateUrl: './step.component.html',
  styleUrls: ['./step.component.scss']
})
export class StepComponent extends WizardStep {

  @Input() stepTitle: string = "";
  complete: boolean = false;
  active: boolean = false;

  constructor(@Optional() wizard: AlWizardStepperComponent) {
    super();
    wizard.addStep(this);
  }

}
