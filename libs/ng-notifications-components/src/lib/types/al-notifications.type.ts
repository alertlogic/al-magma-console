/**
 *  A collection of abstract types related to notifications project.
 *
 *  Authors:
 *      Gisler Garces <ggarces@alertlogic.com>
 *      Andres Echeverri <andres.echeverri@alertlogic.com>
 *  Copyright 2019 but almost 2020 Alert Logic, Inc.
 */

import {
    AIMSAccount,
    AIMSUser,
} from "@al/core";

/**
 * Notifications threat level abstraction.
 */
export interface AlNotificationsThreatLevel {
    value: string;
    caption: string;
}

/**
 * Notifications incidents alert option abstraction.
 */
export interface AlNotificationsIncidentsAlertOptions {
    users?: AIMSUser[];
    accounts?: AIMSAccount[];
    threatLevels?: AlNotificationsThreatLevel[];
}

/**
 * List item details
 */
export interface AlFimDropdownItemDetals {
    id: number|string;
    name: string;
    code: number|string;
}

/**
* Dashboard list items
*/
export interface AlFimDropdownItem {
   label: string;
   icon?: string;
   value?: AlFimDropdownItemDetals[];
   subtext?: string;
}

/**
 * Dropdown p-multiSelect options
 */
export interface OptionAlertFilter {
    title: string;
    value: string;
}
