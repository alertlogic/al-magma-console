/**
 * SIEMlessPreferencesService
 * Service to save or get the Experience Preference via conduit (which uses localstorage)
 *
 * @author Bryan Tabarez <bryan.tabarez@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2019
 */
import { AlConduitClient } from '@al/core';
import { Injectable } from '@angular/core';
import {
    ExperiencePreference,
    IEWarningState,
} from '../types';

@Injectable({
    providedIn: 'root'
})
export class AlExperiencePreferencesService {
    protected conduit = new AlConduitClient();

    constructor( ) {
        this.conduit.start();
    }

    public getExperiencePreferences(): Promise<ExperiencePreference> {
        return this.conduit.getGlobalSetting('experience_settings') as Promise<ExperiencePreference>;
    }

    public deleteExperiencePreferences(): Promise<boolean> {
        return this.conduit.deleteGlobalSetting('experience_settings') as Promise<boolean>;
    }

    public saveIEWarningPreferences(state: IEWarningState): Promise<IEWarningState> {
        return this.conduit.setGlobalSetting('displayed_ie_warning', state) as Promise<IEWarningState>;
    }

    public getIEWarningPreferences(): Promise<IEWarningState> {
        return this.conduit.getGlobalSetting('displayed_ie_warning') as Promise<IEWarningState>;
    }

    public deleteIEWarningPreferences(): Promise<boolean> {
        return this.conduit.deleteGlobalSetting('displayed_ie_warning') as Promise<boolean>;
    }
}
