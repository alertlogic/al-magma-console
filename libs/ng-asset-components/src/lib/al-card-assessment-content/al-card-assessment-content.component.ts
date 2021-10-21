import { AlBaseCardItem } from '@al/ng-cardstack-components';
import { Component, Input } from '@angular/core';
import { AlCardstackItem, AIMSUser } from '@al/core';

@Component({
  selector: 'al-card-assessment-content',
  templateUrl: './al-card-assessment-content.component.html',
  styleUrls: ['./al-card-assessment-content.component.scss']
})
export class AlCardAssessmentContentComponent  {

    @Input() item!: AlBaseCardItem & AlCardstackItem;

    @Input() usersMap: { [id:string]: AIMSUser } = {};

}
