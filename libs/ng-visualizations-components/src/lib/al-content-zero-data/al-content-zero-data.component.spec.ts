/*
 * @author Rob Parker <robert.parker@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2020
 */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AlZeroContentDataComponent } from './al-content-zero-data.component';
import { ZeroStateReason, ZeroState } from '../types';

describe('AlZeroContentDataComponent Test Suite:', () => {
    let component: AlZeroContentDataComponent;
    let fixture: ComponentFixture<AlZeroContentDataComponent>;
    let config: ZeroState;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [AlZeroContentDataComponent]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AlZeroContentDataComponent);
        component = fixture.componentInstance;
        component.config = config;
        fixture.detectChanges();
    });
    describe('On component initialisation with a config supplied containing a zero state reason of', () => {
        describe('"ZeroStateReason.API"', () => {
            describe('and a title and icon value is also supplied', () => {
                beforeAll(() => {
                    config = {
                        nodata: true,
                        reason: ZeroStateReason.API,
                        title: 'Some API error occurred',
                        icon: 'some-error-icon'
                    };
                });
                it('should assign these value to the components equivalent properties', () => {
                    expect(component.title).toEqual(config.title);
                    expect(component.icon).toEqual(config.icon);
                    expect(component.isError).toBeTruthy();
                });
            });
            describe('and a title and icon value is NOT supplied', () => {
                beforeAll(() => {
                    config = {
                        nodata: true,
                        reason: ZeroStateReason.API
                    };
                });
                it('should default to assigning to the components default properties', () => {
                    expect(component.title).toEqual('Error: Unable to load data');
                    expect(component.icon).toEqual('ui-icon-error');
                    expect(component.isError).toBeTruthy();
                });
            });

        });
        describe('"ZeroStateReason.Entitlement"', () => {
            describe('and a title and icon value not containing the term "protection" is also supplied', () => {
                beforeAll(() => {
                    config = {
                        nodata: true,
                        reason: ZeroStateReason.Entitlement,
                        title: 'Some entitlement error occurred',
                        icon: 'some-entitlement-error-icon'
                    };
                });
                it('should assign these value to the components equivalent properties', () => {
                    expect(component.title).toEqual(config.title);
                    expect(component.icon).toEqual(config.icon);
                    expect(component.isError).toBeTruthy();
                });
                it('should determine that a Glyph is not be used', () => {
                    expect(component.isGlyph).toBeFalsy();
                });
            });
            describe('and an icon value  of "protection-1" is supplied', () => {
                beforeAll(() => {
                    config = {
                        nodata: true,
                        reason: ZeroStateReason.Entitlement,
                        icon: 'protection-1'
                    };
                });
                it('should determine that a Glyph is to be used', () => {
                    expect(component.isGlyph).toBeTruthy();
                });
            });
            describe('and a title and icon value is NOT supplied', () => {
                beforeAll(() => {
                    config = {
                        nodata: true,
                        reason: ZeroStateReason.Entitlement
                    };
                });
                it('should default to assigning to the components default properties', () => {
                    expect(component.title).toEqual('You do not have this entitlement.');
                    expect(component.icon).toEqual('ui-icon-block');
                    expect(component.isError).toBeTruthy();
                });
            });

        });
    });

});
