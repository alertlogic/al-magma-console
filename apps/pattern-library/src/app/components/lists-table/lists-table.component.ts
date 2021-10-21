import { Component, OnInit, ViewChild } from '@angular/core';
import { CarService } from '../../../assets/demo/service/carservice';
import { EventService } from '../../../assets/demo/service/eventservice';
import { CustomerService } from '../../../assets/demo/service/customerservice';
import { NodeService } from '../../../assets/demo/service/nodeservice';
import { Car } from '../../../assets/demo/domain/car';
import { Customer, Representative } from '../../../assets/demo/domain/customer';
import { Table } from 'primeng/table';
import { SelectItem, LazyLoadEvent } from 'primeng/api';


export interface TreeNode {
    label?: any;
    data?: any;
    children?: TreeNode[];
    leaf?: boolean;
    expanded?: boolean;
}
@Component({
    selector: 'lists-table',
    templateUrl: './lists-table.component.html',
    styleUrls: ['./lists-table.component.scss'],
})

export class ListsTableComponent implements OnInit {

    customers?: Customer[];

    selectedCustomers?: Customer[];

    representatives?: Representative[];

    statuses?: any[];

    loading?: boolean = true;

    cars1?: Car[];

    cars2?: Car[];

    cars3?: Car[];

    carsVirtual?: Car[] = [];

    cols?: any[];

    cols2?: any[];

    data?: TreeNode[];

    selectedNodeOrg?: TreeNode;

    selectedCar?: Car;

    sourceCars?: Car[];

    targetCars?: Car[];

    orderListCars?: Car[];

    carouselCars?: Car[];

    files1?: TreeNode[];

    files2?: TreeNode[];

    files3?: TreeNode[];

    files4?: TreeNode[];

    events?: any[];

    selectedNode1?: TreeNode;

    selectedNode2?: TreeNode;

    selectedNode3?: TreeNode;

    selectedNodes?: TreeNode[];

    fullcalendarOptions?: any;

    sortOptions?: SelectItem[];

    sortKey?: string;

    sortField?: string;

    sortOrder?: number;

    timeout?: any;

    value?: any;

    customerColumns?: any;

    customerColumnsSelected?: any;

    showColumnsSelector : boolean = true;
    
    showSearch : boolean = true;

    @ViewChild('dt') table!: Table;

    constructor(
        private carService: CarService,
        private eventService: EventService,
        private customerService: CustomerService,
        private nodeService: NodeService,
    ) { }

    getData(searchTxt: string) {
        console.log('OnSearchChanged ', searchTxt);
    }

    ngOnInit() {
        this.customerService.getCustomersLarge().then(customers => {
            this.customers = customers;
            this.loading = false;
        });

        this.cols2 = [
            { field: 'name', header: 'Name' },
            { field: 'size', header: 'Size' },
            { field: 'type', header: 'Type' }
        ];

        this.representatives = [
            { name: "Amy Elsner", image: 'amyelsner.png' },
            { name: "Anna Fali", image: 'annafali.png' },
            { name: "Asiya Javayant", image: 'asiyajavayant.png' },
            { name: "Bernardo Dominic", image: 'bernardodominic.png' },
            { name: "Elwin Sharvill", image: 'elwinsharvill.png' },
            { name: "Ioni Bowcher", image: 'ionibowcher.png' },
            { name: "Ivan Magalhaes", image: 'ivanmagalhaes.png' },
            { name: "Onyama Limba", image: 'onyamalimba.png' },
            { name: "Stephen Shaw", image: 'stephenshaw.png' },
            { name: "XuXue Feng", image: 'xuxuefeng.png' }
        ];

        this.statuses = [
            { label: 'Critical', value: 'critical' },
            { label: 'High', value: 'high' },
            { label: 'Medium', value: 'medium' },
            { label: 'Low', value: 'low' },
            { label: 'Info', value: 'info' }
        ]

        this.carService.getCarsMedium().then(cars => this.cars1 = cars);
        this.cols = [
            { field: 'vin', header: 'Vin' },
            { field: 'year', header: 'Year' },
            { field: 'brand', header: 'Brand' },
            { field: 'color', header: 'Color' }
        ];
        this.cols2 = [
            { field: 'name', header: 'Name' },
            { field: 'size', header: 'Size' },
            { field: 'type', header: 'Type' }
        ];
        this.carService.getCarsMedium().then(cars => this.cars2 = cars);
        this.carService.getCarsLarge().then(cars => this.carsVirtual = cars);
        this.carService.getCarsMedium().then(cars => this.sourceCars = cars);
        this.targetCars = [];
        this.carService.getCarsSmall().then(cars => this.orderListCars = cars);
        this.nodeService.getFiles().then(files => this.files1 = files);
        this.nodeService.getFiles().then(files => this.files2 = files);
        this.nodeService.getFiles().then(files => this.files3 = files);
        this.nodeService.getFilesystem().then(files => this.files4 = files);
        this.eventService.getEvents().then(events => { this.events = events; });

        this.carouselCars = [
            { vin: 'r3278r2', year: 2010, brand: 'Audi', color: 'Black' },
            { vin: 'jhto2g2', year: 2015, brand: 'BMW', color: 'White' },
            { vin: 'h453w54', year: 2012, brand: 'Honda', color: 'Blue' },
            { vin: 'g43gwwg', year: 1998, brand: 'Renault', color: 'White' },
            { vin: 'gf45wg5', year: 2011, brand: 'Volkswagen', color: 'Red' },
            { vin: 'bhv5y5w', year: 2015, brand: 'Jaguar', color: 'Blue' },
            { vin: 'ybw5fsd', year: 2012, brand: 'Ford', color: 'Yellow' },
            { vin: '45665e5', year: 2011, brand: 'Mercedes', color: 'Brown' },
            { vin: 'he6sb5v', year: 2015, brand: 'Ford', color: 'Black' }
        ];

        this.fullcalendarOptions = {
            defaultDate: '2016-01-12',
            header: {
                left: 'prev,next, today',
                center: 'title',
                right: 'month,agendaWeek,agendaDay'
            }
        };

        this.data = [{
            label: 'F.C Barcelona',
            expanded: true,
            children: [
                {
                    label: 'F.C Barcelona',
                    expanded: true,
                    children: [
                        {
                            label: 'Chelsea FC'
                        },
                        {
                            label: 'F.C. Barcelona'
                        }
                    ]
                },
                {
                    label: 'Real Madrid',
                    expanded: true,
                    children: [
                        {
                            label: 'Bayern Munich'
                        },
                        {
                            label: 'Real Madrid'
                        }
                    ]
                }
            ]
        }];

        this.sortOptions = [
            { label: 'Newest First', value: '!year' },
            { label: 'Oldest First', value: 'year' },
            { label: 'Brand', value: 'brand' }
        ];

        this.customerColumns = [
            { header: 'Name', field: 'name', sortableColumn: 'name' },
            { header: 'Country', field: 'country', sortableColumn: 'country.name' },
            { header: 'Representative', field: 'representative', sortableColumn: 'representative.name' },
            { header: 'Date', field: 'date', sortableColumn: 'date' },
            { header: 'Status', field: 'status', sortableColumn: 'status' },
            { header: 'Activity', field: 'activity', sortableColumn: 'activity' }]

        this.customerColumnsSelected = this.customerColumns;
    }

    changeColumns(event: any) {
        const cols = event.columns;
        this.customerColumnsSelected = cols;
    }

    onActivityChange(event: any) {
        const value = event.target.value;
        if (value && value.trim().length) {
            const activity = parseInt(value);

            if (!isNaN(activity)) {
                this.table.filter(activity, 'activity', 'gte');
            }
        }
    }

    onDateSelect(value: any) {
        this.table.filter(this.formatDate(value), 'date', 'equals')
    }

    formatDate(date: any) {
        let month = date.getMonth() + 1;
        let day = date.getDate();

        if (month < 10) {
            month = '0' + month;
        }

        if (day < 10) {
            day = '0' + day;
        }

        return date.getFullYear() + '-' + month + '-' + day;
    }

    onRepresentativeChange(event: any) {
        debugger;
        this.table.filter(event.value, 'representative', 'in')
    }

    loadCarsLazy(event: LazyLoadEvent) {
        if (this.timeout) {
          clearTimeout(this.timeout);
        }
    
        this.timeout = setTimeout(() => {
          this.cars3 = [];
          if (this.carsVirtual) {
            this.cars3 = this.carsVirtual.slice(event.first, (event.first + event.rows));
          }
        }, 2000);
      }
}