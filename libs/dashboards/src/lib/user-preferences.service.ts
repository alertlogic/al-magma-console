/**
 *  @author Robert Parker <robert.parker@alertlogic.com>
 *
 *  @copyright 2019 Alert Logic Inc.
 */

import { Injectable } from '@angular/core';
import { DashboardDisplayPreferences } from './dashboards.types';

@Injectable()
export class UserPreferencesService {

  private dashboardDisplayPrefsLocalStorageKey = 'al-dashboard-display-preferences';
  private dashboardDisplayPrefs: DashboardDisplayPreferences;

  constructor() {
    this.dashboardDisplayPrefs = JSON.parse(localStorage.getItem(this.dashboardDisplayPrefsLocalStorageKey));
    if(!this.dashboardDisplayPrefs) {
      this.dashboardDisplayPrefs = {};
      localStorage.setItem(this.dashboardDisplayPrefsLocalStorageKey, JSON.stringify(this.dashboardDisplayPrefs));
    }
  }

  set(key: string, data: any): void {
    try {
      this.dashboardDisplayPrefs[key] = data;
      localStorage.setItem(this.dashboardDisplayPrefsLocalStorageKey, JSON.stringify(this.dashboardDisplayPrefs));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }

  get(key: string) {
    try {
      return JSON.parse(localStorage.getItem(this.dashboardDisplayPrefsLocalStorageKey))[key];
    } catch (e) {
      console.error('Error getting data from localStorage', e);
      return null;
    }
  }
}
