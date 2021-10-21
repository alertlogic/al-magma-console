/**
 * Test suite for AlArtifactsListComponent
 */
import { AlSession, AlCardstackItem, AIMSUser } from '@al/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {
    ActivatedRoute,
    Router,
    convertToParamMap,
} from '@angular/router';

import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { SlideMenuModule } from 'primeng/slidemenu';

import {
    NgGenericComponentsModule,
} from '@al/ng-generic-components';
import {
    CommonModule,
} from '@angular/common';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { NgCardstackModule } from '@al/ng-cardstack-components';

import { of as observableOf } from 'rxjs';

import { AlArtifactsListComponent } from './al-artifacts-list.component';
import { AlBlobService } from '../services/al-blob-service';
import { ALCargoV2 } from '@al/cargo';
import { AlArtifactsDefinition, AlArtifactsProperties } from '../types/al-artifacts-definition';
import { ALGestaltNotifications } from '@al/gestalt';

describe('AlArtifactsListComponent', () => {
    let component: AlArtifactsListComponent;
    let fixture: ComponentFixture<AlArtifactsListComponent>;
    let blobServiceMock: AlBlobService = new AlBlobService();

    const usersMock:AIMSUser[] = require("../../testing/users-mock.json").users;
    const currentUserMock:AIMSUser = usersMock[0];
    const singleDownloadArtifactMock:AlCardstackItem<AlArtifactsDefinition, AlArtifactsProperties>[] = require("../../testing/artifacts-single-download-mock.json");
    const bulkDownloadArtifactsMock:AlCardstackItem<AlArtifactsDefinition, AlArtifactsProperties>[] = require("../../testing/artifacts-bulk-download-mock.json");

    beforeEach(waitForAsync(() => {
        jest.spyOn(AlSession, "getUser").mockReturnValue(currentUserMock);
        jest.spyOn(ALCargoV2,"getExecutionRecordResult").mockReturnValue(Promise.resolve({}));
        jest.spyOn(ALGestaltNotifications,"getNotificationsCharacteristics").mockReturnValue(
            Promise.resolve(require("../../testing/artifacts-characteristics-mock.json"))
        );
        jest.spyOn(blobServiceMock,"donwloadFile").mockImplementation( () => {} );
        const mockRouter = {
            navigate: jest.fn(),
            events: observableOf(new Event("test")),
        };
        TestBed.configureTestingModule({
            imports: [
                BrowserAnimationsModule,
                ConfirmDialogModule,
                CalendarModule,
                CheckboxModule,
                CommonModule,
                DropdownModule,
                FormsModule,
                InputSwitchModule,
                InputTextModule,
                NgCardstackModule,
                NgGenericComponentsModule,
                PanelModule,
                SlideMenuModule,
            ],
            declarations: [
                AlArtifactsListComponent,
            ],
            providers:  [
                { provide: Router, useValue: mockRouter },
                { provide: AlBlobService, useValue: blobServiceMock},
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: observableOf({
                            accountId: '2', aaid: '2',
                            has: function () { return false; }
                        }),
                        paramMap: observableOf(convertToParamMap({ accountId: '2', aaid: '2' })),
                        queryParamMap: observableOf(convertToParamMap({ accountId: '2', aaid: '2' })),
                        snapshot:{ queryParamMap :convertToParamMap({ accountId:'2' }) },
                    },
                },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AlArtifactsListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('When the component is initiated', () => {
        it('Should build - smoke test', () => {
            component.ngOnInit();
        });
    });

    describe('When it is a single artifact download',() => {
        it("Should donwload only one artifact",() => {
            const singleArtifactSpy = jest.spyOn(component,"artifactDownload");
            component.artifactDownloadBulk(singleDownloadArtifactMock);
            expect(singleArtifactSpy).toHaveBeenCalledWith(singleDownloadArtifactMock[0]);
        });
    });

    describe('When it is a bulk artifacts download',() => {
        it("Should send the list of artifacts ids to download in a single tar",() => {
            const multipleArtifactsSpy = jest.spyOn(ALCargoV2,"getExecutionRecordResultsArchive").mockReturnValue(Promise.resolve({}));
            component.artifactDownloadBulk(bulkDownloadArtifactsMock);
            expect(multipleArtifactsSpy).toHaveBeenCalledWith(
                '2',
                '20200501-360400-394C3F4B-A484-1005-8001-0242AC11003A,20200501-360400-394C3F4B-A484-1005-8001-0242AC11003B,20200501-360400-394C3F4B-A484-1005-8001-0242AC11003C'
            );
        });
    });
});

