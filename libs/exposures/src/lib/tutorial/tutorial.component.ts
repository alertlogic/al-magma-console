import { Component, OnInit, AfterViewInit } from '@angular/core';

import { HostListener } from "@angular/core";
import { AlCabinet } from '@al/core';

@Component({
    selector: "tutorial",
    templateUrl: "./tutorial.component.html",
    styleUrls: ["./tutorial.component.scss"]
})

export class TutorialComponent implements OnInit, AfterViewInit {

    public showSkip: boolean = true;

    /* Session Storage for this app */
    public storage: AlCabinet = AlCabinet.persistent("o3-exposures.state");
    // the score count in tutorial page is just an example
    public scoreConfig = {
        count: { high: 6, medium: 5, low: 2, info: 9 },
        name: "Exposure Count",
        display: "big" // big-tight
    };

    constructor(
        //public dialogRef: MatDialogRef<TutorialComponent>
    ) {
        this.onResize();
    }

    ngOnInit() {

        if (this.storage) {
            if (this.storage.get('Navigation.Open.Tutorial')) {
                this.showSkip = false;
            }
        }

    }

    ngAfterViewInit() {
        if (this.storage) {
            if (!this.storage.get('Navigation.Open.Tutorial')) {
                this.storage.set('Navigation.Open.Tutorial', 'skip');
            }
        }
    }

    closeTutorial(): void {
        //this.dialogRef.close();
    }

    @HostListener('window:resize', ['$event'])
    onResize() {
        if (window.innerWidth < 950) {
            this.scoreConfig.name = "";
            this.scoreConfig.display = "big-tight";
        } else {
            this.scoreConfig.name = "Exposure Count";
            this.scoreConfig.display = "big";
        }
    }
}
