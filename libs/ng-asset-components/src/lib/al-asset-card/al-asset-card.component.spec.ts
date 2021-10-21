import {
    ComponentFixture,
    TestBed,
    fakeAsync,
    tick,
} from '@angular/core/testing';
import { AlAssetCardComponent } from './al-asset-card.component';
import { AlExposureMiniCardComponent } from '../al-exposure-mini-card/al-exposure-mini-card.component';
import { AssetDetail } from '../types';
import { AlAssetsQueryClient } from '@al/assets-query';

describe('AlAssetCardComponent', () => {
    let component: AlAssetCardComponent;
    let fixture: ComponentFixture<AlAssetCardComponent>;

    let assetMock:AssetDetail = {
        accountId: "2313131",
        deploymentId: "9969EC98-F3DD-4040-86C5-6A9019E2F07E",
        icon: "al al-host",
        iconMt: "",
        key: "/aws/us-west-2/host/i-0e3a96ed0ad2b4b48",
        name: "eks-elastic-cluster-ng-1-Node",
        parentExposures: {
          "489a02c4d2022eb7c2550801df621be5": true
        },
        type: "host",
        hasComplementaryData: false,
    } as AssetDetail;

    beforeEach(() => {
        jest.spyOn(AlAssetsQueryClient,"getDeploymentAssets").mockReturnValue(
            Promise.resolve(require('./../../../testing/mocks/asset-details.json')
        ));
        TestBed.configureTestingModule({
            declarations: [ AlAssetCardComponent, AlExposureMiniCardComponent ]
        }).compileComponents();
        fixture = TestBed.createComponent(AlAssetCardComponent);
        component = fixture.componentInstance;
        component.asset = assetMock;
    });

    it('should create the component without failing', () => {
        expect(component).toBeTruthy();
    });

    it('WHEN asset card is expanded should retrieve complementary data', fakeAsync(() => {
        component.toggleAssetDetails({stopPropagation: function () {
            // Mock the event and do nothing during the propagation.
        }});
        tick();
        expect(component.asset.details[0].icon).toEqual('al al-key');
        expect(component.asset.hasComplementaryData).toBeTruthy();
    }));
});
