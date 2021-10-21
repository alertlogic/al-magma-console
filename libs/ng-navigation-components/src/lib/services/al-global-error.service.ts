/**
*
* AlGlobalErrorService
*
* This Service catch all the Javascript Errors in the UI and send metrics
* to Google Analytics using the "track" method.
*
*  @author Fair Tarapues <fair.tarapues@alertlogic.com>
*  @copyright Alert Logic Inc, 2020
*/

import { ErrorHandler, Injectable } from '@angular/core';
import { AlNavigationService } from './al-navigation.service';
import { AlTrackingMetricEventName, AlTrackingMetricEventCategory } from '@al/ng-generic-components';
@Injectable()
export class AlGlobalErrorService implements ErrorHandler {
    constructor( private alNavigation: AlNavigationService ) {}
    handleError(error: Error) {
        console.error(error);
        this.alNavigation.track(AlTrackingMetricEventName.UsageTrackingEvent, {
            category: AlTrackingMetricEventCategory.GenericConsoleException,
            action: "Javascript Error",
            label: error.stack ? error.stack.replace(/"X-AIMS-Auth-Token"\s*:\s*"[A-Za-z0-9\-\._~\+\/\=]+=*"/gmi,'"X-AIMS-Auth-Token":"..."'):
                error.message.replace(/"X-AIMS-Auth-Token"\s*:\s*"[A-Za-z0-9\-\._~\+\/\=]+=*"/gmi,'"X-AIMS-Auth-Token":"..."')
        });
    }
}
