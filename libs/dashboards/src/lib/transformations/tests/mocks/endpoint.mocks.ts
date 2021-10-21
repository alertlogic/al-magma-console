import { AlEndpointsSummaryData } from '@al/endpoints';

export interface SummaryResponse {
  summary: AlEndpointsSummaryData;
}

export const endpointResponse: SummaryResponse = {
  summary: {
      incidentTypes: [
          {
              protectCount: 1,
              monitoredCount: 0,
              ruleName: "MaliciousEXElaunched"
          }
      ],
      endpointsWithIncidents: [
          {
              protectCount: 1,
              monitoredCount: 0,
              endpointId: "e72b5d80-de39-4cbe-ad9d-8cc10d2c11be",
              endpointName: "WIN-PEN1IOGOCO9"
          }
      ],
      usersWithIncidents: [
          {
            protectCount: 1,
            monitoredCount: 0,
            username: "barkly"
          }
      ],
      checkinBreakdown: {
          notRecently: 3,
          online: 2,
          recent: 5
      },
      currencyBreakdown: {
          current: 0,
          outOfDate: 3
      },
      osBreakdown: [
          {
            os: "Apple",
            versions: [ {
              count: 2,
              osName: "Mac OS X 10.14.5",
              osVersion: "18F132"
            }]
          }
      ],
      platformBreakdown: [
          {
              count: 2,
              platformFamily: "Apple",
              platformName: "MacBookPro14,1"
          },
          {
              count: 1,
              platformFamily: "VMware, Inc.",
              platformName: "VMware Virtual Platform"
          }
      ],
      responseBreakdown: {
          isolated: 0,
          unresolved: 0,
          overridden: 0,
          quarantined: 1
      },
      stateBreakdown: {
        primaryState: {
          INSTALLING: 0,
          ARCHIVED: 0,
          INACTIVE: 0,
          OFF: 0,
          ERROR: 0,
          ON: 0
        },
        secondaryState: {
          UPGRADE_NEEDED_WITH_STATUS_OFF: 0,
            UPGRADE_NEEDED_WITH_STATUS_ON: 0,
            UPGRADE_IN_PROGRESS_WITH_STATUS_OFF: 0,
            PENDING_PROTECTION_CHANGE_WITH_STATUS_OFF: 0,
            VIRTUALIZATION_NOT_SUPPORTED_BUT_INSTALLED_WITH_STATUS_OFF: 0,
            INACTIVE_WITH_STATUS_ON: 0,
            REBOOT_REQUIRED: 0,
            INSTALLATION_IN_PROGRESS: 0,
            UPGRADE_IN_PROGRESS_WITH_STATUS_ON: 0,
            MANUALLY_ENABLE_VIRTUALIZATION_WITH_STATUS_OFF: 0,
            REBOOT_REQUIRED_WITH_STATUS_ON: 0,
            THIRTYTWO_BIT_UNSUPPORTED_BUT_INSTALLED_WITH_STATUS_ON: 0,
            VT_MODE_OFF_STATUS_ON: 0,
            DISABLE_HYPERV: 0,
            MANUALLY_ENABLE_VIRTUALIZATION_WITH_STATUS_ON: 0,
            THIRTYTWO_BIT_UNSUPPORTED_BUT_INSTALLED_WITH_STATUS_OFF: 0,
            PENDING_PROTECTION_CHANGE_WITH_STATUS_ON: 0,
            VIRTUALIZATION_NOT_SUPPORTED_BUT_INSTALLED_WITH_STATUS_ON: 0,
            ACTIVE: 0,
            HARDWARE_NOT_SUPPORTED_BUT_INSTALLED_WITH_STATUS_OFF: 0,
            DISABLE_HYPERV_WITH_STATUS_ON: 0,
            THIRTYTWO_BIT_UNSUPPORTED: 0,
            CPU_NOT_SUPPORTED: 0,
            VT_MODE_OFF_STATUS_OFF: 0,
            INACTIVE_WITH_STATUS_OFF: 0,
            DISABLE_HYPERV_WITH_STATUS_OFF: 0,
            PROTECTION_TURNED_OFF: 0,
            REBOOT_REQUIRED_WITH_STATUS_OFF: 0,
            RAPIDVISOR_UNINSTALLED: 0,
            HARDWARE_NOT_SUPPORTED_BUT_INSTALLED_WITH_STATUS_ON: 0,
            VIRTUALIZATION_NOT_SUPPORTED_BUT_INSTALLED: 0,
            MANUALLY_ENABLE_VIRTUALIZATION: 0,
            INACTIVE_WITH_STATUS_ARCHIVED: 0,
            THIRTYTWO_BIT_UNSUPPORTED_BUT_INSTALLED: 0,
            VIRTUALIZATION_NOT_SUPPORTED: 0,
            RAPIDVISOR_ERROR: 0,
            HARDWARE_NOT_SUPPORTED_BUT_INSTALLED: 0
        }
      },
      totalMonitoredIncidents: 0,
      totalProtectIncidents: 1,
      totalIncidents: 1,
      totalEndpoints: 3,
      totalUsers: 1
  }
};
