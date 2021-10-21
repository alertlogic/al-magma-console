/*
 * Dashboard Layout Component Test Suite
 *
 * @author Robert Parker <robert.parker@alertlogic.com>
 * @copyright Alert Logic 2020
 *
 */

import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AlDashboardLayoutComponent } from './al-dashboard-layout.component';
import { Widget, WidgetContentType } from '../types';

describe('AlDashboardLayoutComponent Test Suite:', () => {
    let component: AlDashboardLayoutComponent;
    let fixture: ComponentFixture<AlDashboardLayoutComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [AlDashboardLayoutComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AlDashboardLayoutComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('When a new resize event is triggered', () => {
        beforeEach(() => {
            jest.spyOn(component.resizeStart, 'emit');
            window.dispatchEvent(new Event('resize'));
        });
        it('should call the resizeStart output event emitter', () => {
            expect(component.resizeStart.emit).toHaveBeenCalled();
        });
    });
    // Review the below use of jasmine,clock() - smells to me!
    describe('When two resize events are fired within 1 millisecond of each other', () => {
        // beforeEach(() => {
        //     jasmine.clock().uninstall();
        //     jasmine.clock().install();
        // });

        // afterEach(() => {
        //     jasmine.clock().uninstall();
        // });
        it('should call the resizeStart output event emitter only once', () => {
            jest.useFakeTimers('modern');
            jest.spyOn(component.resizeStart, 'emit');
            window.dispatchEvent(new Event('resize'));
            jest.advanceTimersByTime(1);
            window.dispatchEvent(new Event('resize'));
            expect(component.resizeStart.emit).toHaveBeenCalledTimes(1);
            jest.useRealTimers();
        });
    });

    describe('When calling hasActions() for a given widget config', () => {
        describe('that has actions present', () => {
            const widgetConfig: Widget = {
                id: '1',
                title: 'bla',
                metrics: {
                    height: 1,
                    width: 1
                },
                actions: {
                    primary: {
                       name: 'Investigate'
                    }
                }
            };
            it('should return true', () => {
                expect(component.hasActions(widgetConfig)).toBeTruthy();
            });
        });
        describe('that has an actions property present but no entries', () => {
            const widgetConfig: Widget = {
                id: '1',
                title: 'bla',
                metrics: {
                    height: 1,
                    width: 1
                },
                actions: {
                }
            };
            it('should return false', () => {
                expect(component.hasActions(widgetConfig)).toBeFalsy();
            });
        });
        describe('that has no actions property', () => {
            const widgetConfig: Widget = {
                id: '1',
                title: 'bla',
                metrics: {
                    height: 1,
                    width: 1
                }
            };
            it('should return false', () => {
                expect(component.hasActions(widgetConfig)).toBeFalsy();
            });
        });
    });
    describe('When calling ignoreFooter() for a given widget config', () => {
        describe('that has an ignoreFooter flag set', () => {
            const widgetConfig: Widget = {
                id: '1',
                title: 'bla',
                metrics: {
                    height: 1,
                    width: 1
                },
                content: {
                    type: WidgetContentType.Count,
                    options: {
                        ignoreFooter: true
                    }
                }
            };
            it('should return true', () => {
                expect(component.ignoreFooter(widgetConfig)).toBeTruthy();
            });
        });
        describe('that has no ignoreFooter flag set', () => {
            const widgetConfig: Widget = {
                id: '1',
                title: 'bla',
                metrics: {
                    height: 1,
                    width: 1
                },
                content: {
                    type: WidgetContentType.Count,
                    options: {
                    }
                }
            };
            it('should return false', () => {
                expect(component.ignoreFooter(widgetConfig)).toBeFalsy();
            });
        });
        describe('that has no content property', () => {
            const widgetConfig: Widget = {
                id: '1',
                title: 'bla',
                metrics: {
                    height: 1,
                    width: 1
                }
            };
            it('should return false', () => {
                expect(component.ignoreFooter(widgetConfig)).toBeFalsy();
            });
        });
    });
});
