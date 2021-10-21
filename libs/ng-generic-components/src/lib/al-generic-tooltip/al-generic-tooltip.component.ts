import {
    OnChanges,
    SimpleChanges,
    Input,
    ViewEncapsulation,
    ElementRef,
    Component
} from '@angular/core';

import { AlStopwatch } from '@al/core';

export interface ContainerStyles {
    opacity: string;
    display: string;
    top: string;
    left: string;
    width?: string;
    height?: string;
    'min-width'?: string;
    'min-height'?: string;
}

@Component({
    selector: 'al-generic-tooltip',
    templateUrl: './al-generic-tooltip.component.html',
    styleUrls: ['./al-generic-tooltip.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AlGenericTooltipComponent implements OnChanges {
    /**
     *  This can be either 'left' or 'bottom', and determines the orientation of the arrow.
     */
    @Input() anchor: 'left' | 'bottom' = 'bottom';
    @Input() width: string = 'auto';
    @Input() height: string = 'auto';
    @Input() minWidth: string = '250px';
    @Input() minHeight: string = '120px';
    @Input() offsetX: number = -60;
    @Input() offsetY: number = -50;

    containerStyles: ContainerStyles = {
        opacity: '0.0',
        display: 'none',
        top: '0px',
        left: '0px'
    };

    constructor(private element: ElementRef) {
    }


    /**
     *  On Changes lifecycle handler
     *  Makes sure that changed @Inputs() are merged into the containerStyles property used to provide
     *  dimensions or other properties of the dialog.
     */
    ngOnChanges(changes: SimpleChanges) {
        this.syncInputs();
    }

    /**
     *  Shows the tooltip at a specified offset.
     *
     *  @param {number} x The horizontal offset for the tooltip's indicator point to originate from.
     *  @param {number} y The vertical offset for the tooltip's indicator point to originate from.
     */
    show(x: number, y: number): void {
        this.containerStyles.opacity = '0.0';
        this.containerStyles.display = 'block';
        AlStopwatch.once(() => {
            const childElement = this.element.nativeElement.querySelector('.bubble-wrap');
            this.containerStyles.opacity = '1.0';
            this.containerStyles.top = (y - childElement.clientHeight + this.offsetY).toString() + 'px';
            this.containerStyles.left = (x + this.offsetX).toString() + 'px';
        });
    }


    hide(): void {
        this.containerStyles.opacity = '0.0';
    }

    /**
     *  Syncronizes @Input() properties with containerStyles.
     */
    private syncInputs(): void {
        this.containerStyles.width = this.width;
        this.containerStyles.height = this.height;
        this.containerStyles['min-width'] = this.minWidth;
        this.containerStyles['min-height'] = this.minHeight;
    }
}
