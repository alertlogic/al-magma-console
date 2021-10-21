/* Components */

import { AlActionSnackbarComponent } from './al-action-snackbar/al-action-snackbar.component';
import { AlBottomSheetComponent } from './al-bottom-sheet/al-bottom-sheet.component';
import { AlCheckboxComponent } from './al-checkbox/al-checkbox.component';
import { AlContextClassifierComponent } from './al-context-classifier/al-context-classifier.component';
import { AlDynamicTableComponent } from './al-dynamic-table/al-dynamic-table.component';
import { AlFilterComponent } from './al-filter/al-filter.component';
import { AlFilter2Component } from './al-filter2/al-filter2.component';
import { AlHeaderTemplateDirective } from './al-bottom-sheet/al-header-template.directive';
import { AlFooterTemplateDirective } from './al-bottom-sheet/al-footer-template.directive';
import { AlContentHeaderComponent } from './al-content-header/al-content-header.component';
import { AlContentToolbarComponent } from './al-content-toolbar/al-content-toolbar.component';
import { AlDownloadQueueComponent, AlDownloadQueueDeleteResponse } from './al-download-queue/al-download-queue.component';
import { AlDropdownFilterComponent } from './al-dropdown-filter/al-dropdown-filter.component';
import { AlDropdownListComponent } from './al-dropdown-list/al-dropdown-list.component';
import { AlExternalContentComponent } from './al-external-content/al-external-content.component';
import { AlFeedbackComponent } from './al-feedback/al-feedback.component';
import { AlGenericTooltipComponent  } from './al-generic-tooltip/al-generic-tooltip.component';
import { AlHelpSidebarComponent } from './al-help-sidebar/al-help-sidebar.component';
import { AlIdentityIconComponent } from './al-identity-icon/al-identity-icon.component';
import { AlInitialsComponent } from './al-initials/al-initials.component';
import { AlJsonViewerComponent } from './al-json-viewer/al-json-viewer.component';
import { AlLoadingSpinnerComponent } from './al-loading-spinner/al-loading-spinner.component';
import { AlMenuListComponent } from './al-menu-list/al-menu-list.component';
import { AlMultiSelectListComponent } from './al-multiselect-list/al-multiselect-list.component';
import { AlNotificationPanelComponent } from './al-notification-panel/al-notification-panel.component';
import { AlScoreCountComponent } from './al-score-count/al-score-count.component';
import { AlSearchBarComponent } from './al-search-bar/al-search-bar.component';
import { AlSelectableListComponent } from './al-selectable-list/al-selectable-list.component';
import { AlSelectableChipsComponent } from './al-selectable-chips/al-selectable-chips.component';
import { AlSelectorComponent } from './al-selector/al-selector.component';
import { AlStateFilterComponent } from './al-state-filter/al-state-filter.component';
import { AlSuggestionInputComponent } from './al-suggestion-input/al-suggestion-input.component';
import { AlToastComponent } from './al-toast/al-toast.component';
import { AlViewHelperComponent } from './al-view-helper/al-view-helper.component';
import { AlZeroStateComponent } from './al-zero-state/al-zero-state.component';
import { AlSidebarComponent } from './al-sidebar/al-sidebar.component';
import { AlIconBlockComponent } from './al-icon-block/al-icon-block.component';
import { AlDateRangeSelectorComponent } from './al-date-range-selector/al-date-range-selector.component';
import { AlTimeSelectorComponent } from './al-time-selector/al-time-selector.component';
import { AlWelcomeDialogComponent } from './al-welcome-dialog/al-welcome-dialog.component';
import { AlTimeZoneSelectorComponent } from './al-time-zone-selector/al-time-zone-selector.component';
import { AlCollapsibleLayoutComponent} from './al-collapsible-layout/al-collapsible-layout.component';
import { AlPreviewComponent } from './al-preview/al-preview.component';
import { AlTableCaption } from './al-table-caption/al-table-caption.component';
import { AlTableCaptionV2 } from './al-table-caption-v2/al-table-caption-v2.component';
import { AlWizardStepperComponent } from './al-wizard-stepper/al-wizard-stepper.component';
import { StepComponent } from './al-wizard-stepper/step/step.component';

/* Directives */
import { AlExternalTextDirective } from './directives/al-external-text.directive';
import { AlExternalHtmlDirective } from './directives/al-external-html.directive';
import { AlForceFocusDirective } from './directives/al-force-focus.directive';

/* Pipes */

import { AlCustomDatePipe } from './pipes/al-custom-date-pipe.pipe';
import { AlOrdinalNumberPipe } from './pipes/al-ordinal-number.pipe';
import { AlPrefixMultiplierPipe } from './pipes/al-prefix-multiplier.pipe';
import { AlFilterListPipe } from './pipes/al-filter-list.pipe';
import { AlHtmlizePipe } from './pipes/al-htmlize-pipe';
import { FilterListBySearchPipe } from './pipes/filter-list-by-search-pipe';
import { AlSortPipe } from './pipes/al-sort-pipe';
import { AlDecodeBase64Pipe, AlMarkdownToHtmlPipe, NewlineSplitPipe, RemoveNonPrintablePipe } from './pipes';
import { AlTruncatePipe } from './pipes/al-truncate-pipe';
import { AlPayloadViewerComponent } from './al-payload-viewer';
import { AlHighlightTextComponent } from './directives/highlight';

const ALL_COMMON = [
    AlActionSnackbarComponent,
    AlBottomSheetComponent,
    AlCheckboxComponent,
    AlContentHeaderComponent,
    AlContentToolbarComponent,
    AlContextClassifierComponent,
    AlCustomDatePipe,
    AlDownloadQueueComponent,
    AlDropdownFilterComponent,
    AlDropdownListComponent,
    AlDynamicTableComponent,
    AlExternalContentComponent,
    AlExternalHtmlDirective,
    AlExternalTextDirective,
    AlFeedbackComponent,
    AlForceFocusDirective,
    AlHeaderTemplateDirective,
    AlFooterTemplateDirective,
    AlHelpSidebarComponent,
    AlIdentityIconComponent,
    AlInitialsComponent,
    AlJsonViewerComponent,
    AlLoadingSpinnerComponent,
    AlMenuListComponent,
    AlMultiSelectListComponent,
    AlNotificationPanelComponent,
    AlOrdinalNumberPipe,
    AlPrefixMultiplierPipe,
    AlFilterListPipe,
    AlHtmlizePipe,
    AlScoreCountComponent,
    AlSearchBarComponent,
    AlSelectableChipsComponent,
    AlSelectableListComponent,
    AlSelectorComponent,
    AlStateFilterComponent,
    AlSuggestionInputComponent,
    AlToastComponent,
    AlViewHelperComponent,
    AlZeroStateComponent,
    AlFilterComponent,
    AlFilter2Component,
    FilterListBySearchPipe,
    AlSidebarComponent,
    AlIconBlockComponent,
    AlDateRangeSelectorComponent,
    AlTimeSelectorComponent,
    AlWelcomeDialogComponent,
    AlTimeZoneSelectorComponent,
    AlCollapsibleLayoutComponent,
    AlPreviewComponent,
    AlTableCaption,
    AlTableCaptionV2,
    AlWizardStepperComponent,
    StepComponent,
    AlSortPipe,
    AlMarkdownToHtmlPipe,
    AlTruncatePipe,
    AlPayloadViewerComponent,
    AlHighlightTextComponent,
    NewlineSplitPipe,
    RemoveNonPrintablePipe,
    AlGenericTooltipComponent,
    AlDecodeBase64Pipe,
];

export {
    ALL_COMMON,
    AlActionSnackbarComponent,
    AlBottomSheetComponent,
    AlCheckboxComponent,
    AlContentHeaderComponent,
    AlContentToolbarComponent,
    AlContextClassifierComponent,
    AlCustomDatePipe,
    AlDownloadQueueComponent,
    AlDropdownFilterComponent,
    AlDropdownListComponent,
    AlDynamicTableComponent,
    AlExternalContentComponent,
    AlExternalHtmlDirective,
    AlExternalTextDirective,
    AlFeedbackComponent,
    AlForceFocusDirective,
    AlHeaderTemplateDirective,
    AlFooterTemplateDirective,
    AlHelpSidebarComponent,
    AlIdentityIconComponent,
    AlInitialsComponent,
    AlJsonViewerComponent,
    AlLoadingSpinnerComponent,
    AlMenuListComponent,
    AlMultiSelectListComponent,
    AlNotificationPanelComponent,
    AlOrdinalNumberPipe,
    AlFilterListPipe,
    AlHtmlizePipe,
    AlPrefixMultiplierPipe,
    AlScoreCountComponent,
    AlSearchBarComponent,
    AlSelectableChipsComponent,
    AlSelectableListComponent,
    AlSelectorComponent,
    AlStateFilterComponent,
    AlSuggestionInputComponent,
    AlToastComponent,
    AlViewHelperComponent,
    AlZeroStateComponent,
    AlFilterComponent,
    AlFilter2Component,
    FilterListBySearchPipe,
    AlSidebarComponent,
    AlIconBlockComponent,
    AlDateRangeSelectorComponent,
    AlTimeSelectorComponent,
    AlWelcomeDialogComponent,
    AlTimeZoneSelectorComponent,
    AlCollapsibleLayoutComponent,
    AlPreviewComponent,
    AlTableCaption,
    AlTableCaptionV2,
    AlWizardStepperComponent,
    StepComponent,
    AlSortPipe,
    AlMarkdownToHtmlPipe,
    AlTruncatePipe,
    AlDownloadQueueDeleteResponse,
    AlPayloadViewerComponent,
    AlHighlightTextComponent,
    NewlineSplitPipe,
    RemoveNonPrintablePipe,
    AlGenericTooltipComponent,
    AlDecodeBase64Pipe
};
