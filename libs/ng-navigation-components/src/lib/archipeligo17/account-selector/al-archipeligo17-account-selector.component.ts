import {
    AIMSAccount,
    AlSession,
} from '@al/core';
import {
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { Dropdown } from 'primeng/dropdown';

@Component({
    selector:       'al-archipeligo17-account-selector',
    templateUrl:    './al-archipeligo17-account-selector.component.html',
    styleUrls:      ['./al-archipeligo17-account-selector.component.scss']
})

export class AlArchipeligo17AccountSelectorComponent implements OnInit
{
    /**
     * Account list data and account which is curently active.
     */
    @Input() accountList: AIMSAccount[] = [];
    @Input() activeAccountName:string;
    @Input() activeAccountID: string;

    /**
     * Account selection event
     */
    @Output() accountSelection: EventEmitter<AIMSAccount> = new EventEmitter();

    @ViewChild(Dropdown, {static:false}) dropdown: Dropdown;

    primaryAccountId: string;
    accountListView: AIMSAccount[] = [];
    filteredAccountList: AIMSAccount[] = [];

    /**
     * Flags.
     */
    expanded: boolean = false;
    lastSearch: string = '';

    /**
     * Default view variables.
     */
    viewDefaults = {
        millisecondsToCloseAfterClickOutside : 500 // Magic number that solves when the user click out side and the menu is "disappearing" this give time to mat-menu to close.
    };

    item: AIMSAccount;
    scrollHeight = '480px';

    constructor(private elRef: ElementRef) { }

    ngOnInit() {
        this.primaryAccountId = AlSession.getPrimaryAccountId();
    }

    /**
     * When the user clicks outside of the input and lost the focus
     * it is a mouse leave too.
     */
    focusOutFunction(event:Event) {
        setTimeout(() => {
            this.collapseMenu(event);
        },this.viewDefaults.millisecondsToCloseAfterClickOutside);
    }

    /**
     * When the user change an account.
     */
    onChange( $event:{value:AIMSAccount;originalEvent:MouseEvent} ) {
        console.log("Got change!", $event );
        if($event.value && $event.originalEvent && $event.originalEvent.button === 0){
            this.sendAccount(<AIMSAccount>$event.value);
        }
    }

    sendAccount(account:AIMSAccount) {
        if(!(<any>account).isEmpty){
            this.accountSelection.emit(account);
        }
    }

    /**
     * Receives userInput from search bar component and uses to filter
     * account tiles.
     */
    onSearchChanged( $event:KeyboardEvent ) {
        this.lastSearch = ( $event.target as HTMLInputElement ).value;
        this.filterAccounts();
    }

    /**
     * Filter the account list by name and id based on the search.
     */
    filterAccounts() {
        this.dropdown.filterBy = "label,value.id";
        this.dropdown.filterValue = this.lastSearch;
        this.dropdown.emptyFilterMessage = "No accounts matched your search.";
        this.dropdown.activateFilter();
        if(this.dropdown.optionsToDisplay && this.dropdown.optionsToDisplay.length === 0){
            this.dropdown.optionsToDisplay = [{
                label: 'No accounts matched your search.',
                value: {
                    isEmpty: true
                }
            }];
        }
        this.resizeDropdown();
    }

    resizeDropdown() {
        if(this.dropdown.optionsToDisplay){
            let height = this.dropdown.optionsToDisplay.length >= 10 ? 480 : 48 * this.dropdown.optionsToDisplay.length;
            this.scrollHeight = height + 'px';
        }
    }

    @HostListener('document:keydown.escape', ['$event']) onKeydownEscapeHandler(evt: KeyboardEvent) {
        if (this.expanded) {
            this.focusOutFunction(evt);
        }
     }

    @HostListener('document:keydown.enter', ['$event']) onKeydownEnterHandler(evt: KeyboardEvent) {
        if(this.dropdown && this.dropdown.selectedOption) {
            this.sendAccount(<AIMSAccount>this.dropdown.selectedOption.value);
            this.collapseMenu(evt);
        }
    }

    /**
     * Expands the menu and disable the scrolling on the page.
     */
    expandMenu() {
        this.sortAccounts();
        this.expanded = true;
        setTimeout(() => {
            this.dropdown.focus();
            this.dropdown.show();
            this.resizeDropdown();
        });
        if (this.elRef && this.elRef.nativeElement && this.elRef.nativeElement.ownerDocument.body) {
            this.elRef.nativeElement.ownerDocument.body.style.overflow = 'hidden';
        }
    }

    /**
     * Collapse the menu and return the scrolling to the page.
     */
    collapseMenu($event:Event) {
        this.expanded = false;
        this.clearFilter($event);
        // Return the scrolling to the page.
        if (this.elRef && this.elRef.nativeElement && this.elRef.nativeElement.ownerDocument.body) {
            this.elRef.nativeElement.ownerDocument.body.style.overflow = 'auto';
        }
    }

    /**
     * Execute the sort of the accounts and then show the result
     * in the view.
     */
    sortAccounts() {
        this.accountList = this.accountList.sort(( a, b ) => {
            if ( a.name > b.name ) {
                return 1;
            }
            if ( a.name < b.name ) {
                return -1;
            }
            return 0;
        });
        console.log("Accounts", this.accountList );
    }

    clearFilter($event:Event) {
        if(this.dropdown) {
            this.dropdown.clear($event);
        }
    }
}
