/*
 * Dashboard Widget Container Component
 *
 * @author Stephen Jones <stephen.jones@alertlogic.com>
 * @copyright Alert Logic, 2019
 *
 */
import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { Widget, WidgetClickType, WidgetButtonAction, WidgetContentType, DashboardWidgetClickDetails } from '../types';

export interface EmitValues {
    id: string;
    clickType: WidgetClickType;
}

@Component({
    selector: 'al-dashboard-widget',
    templateUrl: './al-dashboard-widget.component.html',
    styleUrls: ['./al-dashboard-widget.component.scss']
})

export class AlDashboardWidgetComponent implements OnInit {

    public hasActions = false;
    public contentType: typeof WidgetContentType = WidgetContentType;

    // Default Configjhsgdgsadvsh
    @Input() config: Widget = {
        title: '',
        id: '',
        metrics: {
            height: 1,
            width: 5
        }
    };

    constructor(private el: ElementRef) { }

    /*
     *  When setting up test the config object for any actionLabels.  These render strings to the
     *  appropriate buttons or links.  If none are passed then the bottom bar should not be rendered.
     */
    ngOnInit() {
        this.hasActions = this.config.hasOwnProperty('actions')
            && Object.keys(this.config.actions).length > 0;
    }

    /*
     * Event Handlers
     */

    /*
     * Primary Button Clicked
     */
    public primaryClicked(event: MouseEvent): void {
        this.emitClick(this.config.actions.primary.action, WidgetClickType.Primary, null, event);
    }

    /**
     * Data element clicked
     */
    public dataElementClicked(ev: CustomEventInit<{ recordLink: { [p: string]: string } | WidgetButtonAction, event: MouseEvent }>): void {
        const widgetActions = this.config.actions;
        this.emitClick(widgetActions.drilldown ? widgetActions.drilldown.action : undefined, WidgetClickType.DrillDown, ev.detail.recordLink, ev.detail.event);
    }

    /*
     * Settings Button Clicked
     */
    public settingsClicked(): void {
        // this.emitClick(this.config.actions.settings);
    }

    /*
     * Link1 Button Clicked
     */
    public link1Clicked(event: MouseEvent): void {
        this.emitClick(this.config.actions.link1.action, WidgetClickType.Link1, null, event);
    }

    /*
     * Link2 Button Clicked
     */
    public link2Clicked(event: MouseEvent): void {
        this.emitClick(this.config.actions.link2.action, WidgetClickType.Link2, null, event);
    }

    /*
     *  Event emitters don't bubble.  Use a dom dispatchEvent mechanism to dispatch
     *  the event as far up as required
     */
    private emitClick(buttonAction: WidgetButtonAction, widgetButton: WidgetClickType, recordLink?: { [p: string]: string } | WidgetButtonAction, event?: MouseEvent): void {
        let evDetail: DashboardWidgetClickDetails;
        if (!recordLink) {
            if (buttonAction) {
                evDetail = {
                    event,
                    buttonAction,
                    widgetButton,
                    id: this.config.id,
                    title: this.config.title
                };
                this.el.nativeElement
                    .dispatchEvent(new CustomEvent('button-clicked', {
                        detail: evDetail,
                        bubbles: true
                    }));
            } else {
                console.warn(`No button action found from widget click event - ${event}`);
            }
        } else {
            if (buttonAction) {
                evDetail = {
                    event,
                    targetApp: buttonAction.target_app,
                    targetAppPath: buttonAction.path,
                    targetArgs: { ...recordLink, ...buttonAction.query_params }
                };
            }
            if (recordLink.hasOwnProperty('target_app')) { // dealing with custom table cell case here???
                const drillDownAction = (<WidgetButtonAction>recordLink);
                evDetail = {
                    event,
                    targetApp: drillDownAction.target_app,
                    targetAppPath: drillDownAction.path,
                    targetArgs: drillDownAction.query_params
                };
            }
            this.el.nativeElement
                .dispatchEvent(new CustomEvent('view-filtered-records', {
                    detail: evDetail,
                    bubbles: true
                }));
        }
    }
}
