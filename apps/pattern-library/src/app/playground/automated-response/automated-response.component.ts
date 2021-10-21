import { Component, OnInit } from '@angular/core';

interface TriggerAction {
  iconClass?: string,
  icon?: string,
  title?: string,
}

interface PlaybookAction {
  iconClass?: string,
  icon?: string,
  title: string,
  expanded?: boolean,
  config?: any[],
  validConfig?: boolean
}

@Component({
  selector: 'app-automated-response',
  templateUrl: './automated-response.component.html',
  styleUrls: ['./automated-response.component.scss']
})
export class AutomatedResponseComponent implements OnInit {

  triggerActions: TriggerAction[] = [];
  selectedTrigger: TriggerAction | null = null;
  triggerOptions: boolean = false;
  triggerExpanded: boolean = false;

  playbookActions: PlaybookAction[] = [];
  selectedActions: PlaybookAction[] = [];
  actionOptions: boolean = false;
  splitAction: boolean = false;

  constructor() { }

  ngOnInit(): void {
    // get the playbook actions
    this.getPlaybookActions()
    .then(data => {
      this.playbookActions = data.playbookActions;
      this.triggerActions = data.triggers;
    })
    .catch(reason => console.log(reason.message));
  }

  async getPlaybookActions() {
    const response = await fetch('assets/demo/data/automated-response/playbook-actions.json');
    return await response.json();
  }

  addTrigger(trigger: TriggerAction): void {
    this.selectedTrigger = {...trigger};
    this.triggerOptions = false;
  }

  removeTrigger(): void {
    this.selectedTrigger = null;
    this.selectedActions = [];
  }

  addAction(action: PlaybookAction): void {
    this.selectedActions = [...this.selectedActions, {...action}];
    this.actionOptions = false;
  }

  removeAction(index: number): void {
    this.selectedActions[index].expanded = false;
    this.selectedActions.splice(index, 1);
  }

  expandConfig(index: number): void {
    this.selectedActions[index].expanded = !this.selectedActions[index].expanded;
  }

  validateConfig(index: number): void {
    this.selectedActions[index].validConfig = true;
    let action = this.playbookActions.find(action => {
      return action.title === this.selectedActions[index].title;
    });

    if (action) { action.validConfig = true; }
  }


}
