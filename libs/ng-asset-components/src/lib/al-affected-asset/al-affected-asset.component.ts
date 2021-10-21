import { Component, Input } from '@angular/core';
import { AffectedAssetDetails } from '../types';

@Component({
  selector: 'al-affected-asset',
  templateUrl: './al-affected-asset.component.html',
  styleUrls: ['./al-affected-asset.component.scss']
})
export class AlAffectedAssetComponent{

    @Input() affectedAssetDetail!: AffectedAssetDetails;
    @Input() toggleable = false;
}
