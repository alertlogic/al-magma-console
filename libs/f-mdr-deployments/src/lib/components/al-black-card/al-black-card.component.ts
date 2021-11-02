import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AlBlackCardDescriptor } from '../../types';

@Component({
    selector: 'al-black-card',
    templateUrl: './al-black-card.component.html',
    styleUrls: ['./al-black-card.component.scss']
})
export class AlBlackCardComponent  {

    @Input() dataCard: AlBlackCardDescriptor;
    @Output() clickCard: EventEmitter<AlBlackCardDescriptor> = new EventEmitter();

    emitClick(){
        this.clickCard.emit(this.dataCard);
    }

}
