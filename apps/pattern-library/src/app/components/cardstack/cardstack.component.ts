import { Component, OnInit } from '@angular/core';

import { SampleCardstackView } from './sample-cardstack';

@Component({
    selector: 'al-alerts',
    templateUrl: './cardstack.component.html',
    styleUrls: ['./cardstack.component.scss']
})

export class CardstackComponent implements OnInit {
    public view:SampleCardstackView = new SampleCardstackView();

    ngOnInit() {
        this.view.start();
    }
}
