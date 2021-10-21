import { Component, OnInit, Input, OnChanges, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { TableListConfig } from '../types';
import { OverlayPanel } from 'primeng/overlaypanel';
import { SortEvent } from 'primeng/api/sortevent';

interface RowBody extends Array<{[i:string]:string|number}> {
  recordLink:any ;
}

@Component({
  selector: 'al-detailed-table-list',
  templateUrl: './al-detailed-table-list.component.html',
  styleUrls: ['./al-detailed-table-list.component.scss']
})
export class AlDetailedTableListComponent implements OnInit, OnChanges {

    public tableConfig: TableListConfig;
    public mouseOverContent: string;
    public showTooltip = false;

    /*
     * Configuration of the table
     */
    @Input() config: TableListConfig;


    @ViewChild('op', {static:true}) op: OverlayPanel;

    constructor(private el: ElementRef) {}

    ngOnChanges(changes: SimpleChanges): void {
      this.addClickClass(this.config);
      this.tableConfig = this.config;
    }

    ngOnInit() {
      this.addClickClass(this.config);
      this.tableConfig = this.config;
    }

    onDataRowClick(event: MouseEvent, rowBody: RowBody ) {
      if (rowBody.hasOwnProperty('recordLink')) {
        this.el.nativeElement
          .dispatchEvent(new CustomEvent('data-element-clicked', {
            detail: {
              event,
              recordLink: rowBody.recordLink
            },
            bubbles: true
          }));
      } else {
        console.log('No record link data attribute found for selected table row!');
      }

    }

    onDataCellClick(event: MouseEvent, dataCell:any) {
      if (dataCell.hasOwnProperty('recordLink')) {
        this.el.nativeElement
          .dispatchEvent(new CustomEvent('data-element-clicked', {
            detail: {
              event,
              recordLink: dataCell.recordLink
            },
            bubbles: true
          }));
      }
    }

    /*
     * Iterate through each item in the data series and add a 'clickable'
     * class to all data elements that contain a recordLink property
     */
    public addClickClass = (config: TableListConfig): void => {
      config.body.forEach(row => {
        if (row.hasOwnProperty('recordLink')) {
          row.clickable = true;
        }
      });
    }

    onContentMouseOver(event:MouseEvent, overlayTarget:HTMLDivElement, content: string, classList: string) {
      if(classList &&  classList.includes('multiline-content')) {
        this.mouseOverContent = content;
        if (this.op.target === null || this.op.target === undefined) {
          this.op.show(event, overlayTarget);
        }
      } else {
        this.op.hide();
      }
    }

    onContentMouseOut() {
      this.mouseOverContent = '';
      this.op.hide();
    }

    extractCellValue(bodyValue:any) {
      return (bodyValue && bodyValue.hasOwnProperty('value')) ? bodyValue.value: bodyValue;
    }

    extractCellCss(bodyRow:any, fieldName:string): string | number | any {
      if(fieldName === 'status') {
        return bodyRow.status;
      }
      let cssName = '';
      if (bodyRow.hasOwnProperty(fieldName) && bodyRow[fieldName] !== null) {
        cssName += bodyRow[fieldName].cssName ? bodyRow[fieldName].cssName : '';
        cssName += bodyRow[fieldName].recordLink ? ' clickable' : '';
      }
      return cssName;
    }

    customSort(event: SortEvent) {
      if(event.data) {
        event.data.sort((data1:any, data2:any) => {
          let value1 = data1[event.field as string];
          if(value1.hasOwnProperty('value')) {
            value1 = value1.value;
          }
          let value2 = data2[event.field as string];
          if(value2.hasOwnProperty('value')) {
            value2 = value2.value;
          }
          let result = null;

          if (value1 == null && value2 != null) {
              result = -1;
          } else if (value1 != null && value2 == null) {
              result = 1;
          } else if (value1 == null && value2 == null) {
              result = 0;
          } else if (typeof value1 === 'number' && typeof value2 === 'string') {
              result = 1;
          } else if (typeof value1 === 'string' && typeof value2 === 'number') {
              result = -1;
          } else if (typeof value1 === 'string' && typeof value2 === 'string') {
              result = value1.localeCompare(value2);
        }   else {
              result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;
          }
          return (event.order as number * result);
        });
      }

  }
}
