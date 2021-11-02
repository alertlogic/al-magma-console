import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { SystemLogCard, CardCollectEvent } from '../../types/system-log.types';
import { AlBaseCardFooterActionEvent, AlBaseCardItem } from '@al/ng-cardstack-components';

@Component({
    selector: 'al-system-log-card',
    templateUrl: './system-log-card.component.html',
    styleUrls: ['./system-log-card.component.scss']
})
export class SystemLogCardComponent implements OnInit {

    @Input() card: SystemLogCard;
    @Output() onAction: EventEmitter<AlBaseCardFooterActionEvent> = new EventEmitter<AlBaseCardFooterActionEvent>();
    @Output() onCollect: EventEmitter<CardCollectEvent> = new EventEmitter<CardCollectEvent>();
    @Output() onExpand: EventEmitter<AlBaseCardItem> = new EventEmitter<AlBaseCardItem>();

    constructor() { }

    ngOnInit() {
    }

    footerAction(event: AlBaseCardFooterActionEvent) {
        this.onAction.emit(event);
    }

    collect(event: CardCollectEvent) {
        this.onCollect.emit(event);
    }

    expand(event: AlBaseCardItem) {
        this.onExpand.emit(event);
    }

}
