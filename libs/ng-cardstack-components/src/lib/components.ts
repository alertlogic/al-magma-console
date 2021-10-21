import { AlBaseCardComponent } from './al-base-card/al-base-card.component';
import {
    AlBaseCardBodyContentTemplateDirective,
    AlBaseCardContentTemplateDirective,
    AlBaseCardFooterTemplateDirective,
    AlBaseCardHeaderRightTemplateDirective,
    AlBaseCardHeaderTemplateDirective,
    AlBaseCardIconTemplateDirective,
    AlBaseCardTitleTemplateDirective,
    AlBaseCardCaptionTemplateDirective,
    AlBaseCardSubtitleTemplateDirective,
    AlBaseCardHeaderExtraContentTemplateDirective
} from './al-base-card/al-base-card-templates.directive';
import { AlCardstackComponent } from './al-cardstack/al-cardstack.component';
import { CardGroupByPipe } from "./pipes/card-group-by.pipe";
import { ContainsPipe } from './pipes/contains-pipe.pipe';
import { FilterListByActiveFiltersPipe } from './pipes/filter-list-by-active-filters-pipe';

const CARDSTACK_COMPONENTS = [
    AlCardstackComponent,
    ContainsPipe,
    FilterListByActiveFiltersPipe,
    AlBaseCardBodyContentTemplateDirective,
    AlBaseCardContentTemplateDirective,
    AlBaseCardIconTemplateDirective,
    AlBaseCardTitleTemplateDirective,
    AlBaseCardCaptionTemplateDirective,
    AlBaseCardSubtitleTemplateDirective,
    AlBaseCardFooterTemplateDirective,
    AlBaseCardHeaderRightTemplateDirective,
    AlBaseCardHeaderTemplateDirective,
    AlBaseCardHeaderExtraContentTemplateDirective,
    AlBaseCardComponent,
    CardGroupByPipe,
];

export {
    CARDSTACK_COMPONENTS,
    AlCardstackComponent,
    ContainsPipe,
    FilterListByActiveFiltersPipe,
    AlBaseCardBodyContentTemplateDirective,
    AlBaseCardContentTemplateDirective,
    AlBaseCardIconTemplateDirective,
    AlBaseCardTitleTemplateDirective,
    AlBaseCardCaptionTemplateDirective,
    AlBaseCardSubtitleTemplateDirective,
    AlBaseCardFooterTemplateDirective,
    AlBaseCardHeaderRightTemplateDirective,
    AlBaseCardHeaderTemplateDirective,
    AlBaseCardHeaderExtraContentTemplateDirective,
    AlBaseCardComponent,
    CardGroupByPipe,
};
