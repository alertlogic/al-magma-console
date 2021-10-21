import { AlCardstackItem } from '@al/core';
import {
    Component,
    ContentChild,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewEncapsulation,
} from '@angular/core';
import {
    AlBaseCardBodyContentTemplateDirective,
    AlBaseCardFooterTemplateDirective,
    AlBaseCardHeaderRightTemplateDirective,
    AlBaseCardHeaderTemplateDirective,
    AlBaseCardIconTemplateDirective,
    AlBaseCardSubtitleTemplateDirective,
    AlBaseCardTitleTemplateDirective,
    AlBaseCardContentTemplateDirective,
    AlBaseCardHeaderExtraContentTemplateDirective
} from './al-base-card-templates.directive';
import {
    AlActionFooterButtons,
    AlBaseCardConfig,
    AlBaseCardFooterActionEvent,
    AlBaseCardFooterActions,
    AlBaseCardItem,
    AlItemCount,
} from './al-base-card.types';

@Component({
    selector: 'al-base-card',
    templateUrl: './al-base-card.component.html',
    styleUrls: ['./al-base-card.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AlBaseCardComponent implements OnInit, OnChanges {

    public hiddenIcon: boolean = false;

    @ContentChild(AlBaseCardHeaderTemplateDirective, {static:false}) alBaseCardHeader?: AlBaseCardHeaderTemplateDirective;
    @ContentChild(AlBaseCardIconTemplateDirective, {static:false}) alBaseCardIcon?: AlBaseCardIconTemplateDirective;
    @ContentChild(AlBaseCardTitleTemplateDirective, {static:false}) alBaseCardTitle?: AlBaseCardTitleTemplateDirective;
    @ContentChild(AlBaseCardContentTemplateDirective, {static:false}) alBaseCardContent?: AlBaseCardContentTemplateDirective;
    @ContentChild(AlBaseCardSubtitleTemplateDirective, {static:false}) alBaseCardSubtitle?: AlBaseCardSubtitleTemplateDirective;
    @ContentChild(AlBaseCardHeaderRightTemplateDirective, {static:false}) alBaseCardHeaderRight?: AlBaseCardHeaderRightTemplateDirective;
    @ContentChild(AlBaseCardBodyContentTemplateDirective, {static:false}) alBaseCardBodyContent?: AlBaseCardBodyContentTemplateDirective;
    @ContentChild(AlBaseCardFooterTemplateDirective, {static:false}) alBaseCardFooter?: AlBaseCardFooterTemplateDirective;
    @ContentChild(AlBaseCardHeaderExtraContentTemplateDirective, {static:false}) alBaseCardHeaderExtraContent?: AlBaseCardHeaderExtraContentTemplateDirective;

    // An object with the information to be painted
    @Input() item!: AlBaseCardItem & AlCardstackItem;
    // An object that allows establishing the footer buttons
    @Input() footerFunction?: (item: AlBaseCardItem) => AlBaseCardFooterActions;
    @Input() iconFunction?: (item: any) => { name: string, text?: string};

    // initial card setup
    @Input() config: AlBaseCardConfig = {
        toggleable: false,
        toggleableButton: false,
        checkable: false,
        hasIcon: false,
        style: 'card'
    };

    // Allows to change the checkbox state
    @Input() set checked(checked: boolean) {
        if (this.item) {
            this.item.checked = checked;
        }
    }

    @Output() onChangeChecked = new EventEmitter<AlBaseCardItem>();
    @Output() onFooterAction = new EventEmitter<AlBaseCardFooterActionEvent>();
    @Output() onExpand = new EventEmitter<AlBaseCardItem>();

    ngOnInit(): void {
        this.itemSetup();
    }

    ngOnChanges(changes: SimpleChanges) {
        if('item' in changes){
            this.itemSetup();
        }
    }

    // imho this is the wrong place to "Set up" the items, the base card should only display, not logic for this needed.
    // the item should come in with the icon and footer actions already set up, but thats harder to unravel right now
    // TODO: move these out of basecard
    itemSetup(){
        if (this.item) {
            if (this.iconFunction && this.iconFunction instanceof Function) {
                this.item.icon = this.iconFunction(this.item);
            }
            if(this.footerFunction && this.footerFunction instanceof Function){
                this.item.footerActions = this.footerFunction(this.item);
            }
        }

    }

    /**
     * Change the checkbox state and emit an event
     * @param checked: boolean
     */
    toggleCheck(checked: boolean): void {
        (this.item as AlBaseCardItem).checked = checked;
        this.onChangeChecked.emit(this.item);
    }

    /**
     * Emit an event when an option of footer actions is clicked
     */
    footerAction(eventName: string, item: AlBaseCardItem): void {
        const event: AlBaseCardFooterActionEvent = {
            name: eventName,
            value: item
        };
        this.onFooterAction.emit(event);
    }

    itemCountTackByFn(index: number, item: AlItemCount): string {
        return item.text;

    }

    actionTrackByFn(index:number, item:AlActionFooterButtons):string{
        return item.text;
    }

    emitExpand(item: AlBaseCardItem) {
        this.onExpand.emit(item);
    }
}
