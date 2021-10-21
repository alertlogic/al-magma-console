/*
 * Dashboard Widget Container Component
 *
 * @author Stephen Jones <stephen.jones@alertlogic.com>
 * @copyright Alert Logic, 2019
 *
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AlDashboardWidgetComponent } from './al-dashboard-widget.component';
import { ButtonModule } from 'primeng/button';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';

describe('AlDashboardWidgetComponent', () => {
    let component: AlDashboardWidgetComponent;
    let fixture: ComponentFixture<AlDashboardWidgetComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [ButtonModule, TooltipModule],
            declarations: [AlDashboardWidgetComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AlDashboardWidgetComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.config = {
          id: '1',
          title: 'Test Title',
          metrics: {
            height: 1,
            width: 1
          }
        };
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    /*
     *  Config Tests
     */
    describe('when reading in the config', () => {
        it('should set hasActions to false when no actions are passed in', () => {
            component.ngOnInit();
            expect(component.hasActions).toEqual(false);
        });

        it('should set hasActions to true when an action label is passed in', () => {
            Object.assign(component.config, {
                actions: {
                    primary: {
                      name: 'Primary',
                      action: {
                        target_app: 'foo',
                        path: 'bar'
                      }
                    }
                }
            });

            component.ngOnInit();
            expect(component.hasActions).toEqual(true);
        });
    });

    /*
     *  Action / Button click events
     */
    describe('when clicking the action buttons / links', () => {
        it('should emit the primary event when the primary button is clicked', () => {
            Object.assign(component.config, {
                actions: {
                    primary: {
                      name: 'Primary',
                      action: {
                        target_app: 'foo',
                        path: 'bar',
                        event: {}
                      }
                    }
                }
            });

            const eventSpy = jest.fn();
            const event: MouseEvent = {} as MouseEvent;
            fixture.nativeElement.addEventListener('button-clicked', eventSpy);
            component.primaryClicked(event);
            expect(eventSpy).toHaveBeenCalled();
        });

        it('should emit the primary event when the drill down button is clicked', () => {
            Object.assign(component.config, {
                actions: {
                    drilldown: {
                      name: '',
                      action: {
                        target_app: 'foo',
                        path: 'bar',
                        event: {}
                      }
                    }
                }
            });

            const eventSpy = jest.fn();
            fixture.nativeElement.addEventListener('view-filtered-records', eventSpy);
            const ev: CustomEventInit = {
              detail: {
                recordLink: 'foo/bar'
              }
            };
            component.dataElementClicked(ev);
            expect(eventSpy).toHaveBeenCalled();
        });

        xit('should emit the settings event when the settings button is clicked', () => {
            Object.assign(component.config, {
                actions: {
                    settings: 'Settings'
                }
            });

            const eventSpy = jest.fn();
            fixture.nativeElement.addEventListener('button-clicked', eventSpy);
            component.settingsClicked();
            expect(eventSpy).toHaveBeenCalled();
        });

        it('should emit the link 1 event when the link 1 link is clicked', () => {
            Object.assign(component.config, {
                actions: {
                    link1: {
                      name: 'Link 1',
                      action: {
                        target_app: 'foo',
                        path: 'bar'
                      }
                    }
                }
            });

            const eventSpy = jest.fn();
            const event: MouseEvent = {} as MouseEvent;
            fixture.nativeElement.addEventListener('button-clicked', eventSpy);
            component.link1Clicked(event);
            expect(eventSpy).toHaveBeenCalled();
        });

        it('should emit the link 2 event when the link 2 link is clicked', () => {
            Object.assign(component.config, {
                actions: {
                    link2: {
                      name: 'Link 2',
                      action: {
                        target_app: 'foo',
                        path: 'bar'
                      }
                    }
                }
            });

            const eventSpy = jest.fn();
            const event: MouseEvent = {} as MouseEvent;
            fixture.nativeElement.addEventListener('button-clicked', eventSpy);
            component.link2Clicked(event);
            expect(eventSpy).toHaveBeenCalled();
        });
    });
});
