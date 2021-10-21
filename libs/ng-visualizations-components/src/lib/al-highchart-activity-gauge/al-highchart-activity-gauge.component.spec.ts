/*
 * Highcharts Activity Gauge Component
 *
 * @author stephen.jones <stephen.jones@alertlogic.com>
 * @copyright Alert Logic 2019
 *
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AlHighchartsActivityGaugeComponent } from './al-highchart-activity-gauge.component';
import { ActivityGaugeConfig, ActivityGaugeValueFormat } from '../types';


describe('AlHighchartsActivityGaugeComponent', () => {
    let component: AlHighchartsActivityGaugeComponent;
    let fixture: ComponentFixture<AlHighchartsActivityGaugeComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [AlHighchartsActivityGaugeComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AlHighchartsActivityGaugeComponent);
        component = fixture.componentInstance;
        component.config = {
            value: 50,
            maxValue: 50,
            valueFormat: ActivityGaugeValueFormat.ValueOnly
        } as ActivityGaugeConfig;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
