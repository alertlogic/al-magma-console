import { AlCabinet } from '@al/core';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { TutorialComponent } from './tutorial.component';

class MatDialogRefMock {
    close() { }
}

describe('TutorialComponent', () => {
    var fixture: ComponentFixture<TutorialComponent>;
    var component: TutorialComponent;

    beforeEach(()=> {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [  ],
            declarations: [
                TutorialComponent
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            providers: [
                { provide: MatDialogRef, useClass: MatDialogRefMock }
            ]
        }).compileComponents();
        fixture = TestBed.createComponent(TutorialComponent);
        component = fixture.componentInstance;
    });

    describe('when the component is created', () => {
        it('should match with the initial values', () => {
            expect(component.showSkip).toEqual(true);
            expect(component.storage).toEqual(AlCabinet.persistent("o3-exposures.state"));
        });
    });

    describe('when the ngOnInit is called', () => {
        it('should review if the page was already seen by the user and set the showSkip in false', () => {
            jest.spyOn(component.storage, 'get').mockReturnValue(true);
            component.ngOnInit();
            expect(component.showSkip).toEqual(false);
        });

        it('should review if the page was already seen by the user and do nothing', () => {
            jest.spyOn(component.storage, 'get').mockReturnValue(false);
            component.ngOnInit();
            expect(component.showSkip).toEqual(true);
        });
    });

    describe('when the ngAfterViewInit is called', () => {

        it('should review if the page was already seen by the user and set the showSkip in false', () => {
            jest.spyOn(component.storage, 'set');
            component.ngAfterViewInit();
            expect(component.storage.set).toHaveBeenCalledTimes(1);
            expect(component.storage.set).toHaveBeenCalledWith('Navigation.Open.Tutorial', 'skip');
        });
    });

    // describe('when the closeTutorial is called', () => {
    //     it('should call dialogRef close', () => {
    //         jest.spyOn(component.dialogRef, 'close');
    //         component.closeTutorial();
    //         expect(component.dialogRef.close).toHaveBeenCalledTimes(1);
    //     });
    // });
});
