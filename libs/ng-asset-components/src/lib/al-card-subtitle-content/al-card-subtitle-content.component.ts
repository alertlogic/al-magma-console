import { AlBaseCardItem } from '@al/ng-cardstack-components';
import { Component,Input } from '@angular/core';
import { AlCardstackItem, AIMSUser } from '@al/core';

@Component({
  selector: 'al-card-subtitle-content',
  templateUrl: './al-card-subtitle-content.component.html',
  styleUrls: ['./al-card-subtitle-content.component.scss']
})
export class AlCardSubtitleContentComponent {

  @Input() item!: AlBaseCardItem & AlCardstackItem;

  @Input() usersMap: { [id:string]: AIMSUser } = {};
}
