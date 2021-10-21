import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
    name: 'alCustomDatePipe'
})
export class AlCustomDatePipe implements PipeTransform {
    constructor(private datePipe: DatePipe) { }

    transform(date: Date): string {
        let suffix = '';
        let value = parseInt(this.datePipe.transform(date, "d") as string, 10);
        switch (value % 10) {
            case 1: {
                suffix = "st";
                break;
            }
            case 2: {
                suffix = "nd";
                break;
            }
            case 3: {
                suffix = "rd";
                break;
            }
            default: suffix = "th";
        }
        return value + suffix + this.datePipe.transform(date, " MMM yyyy");
    }
}
