// Mociking The URL Filter Service From Navigation.
export class UrlFilterServiceMock {

    constructor(  ){}

    updateFiltersInUrl() { }

    fromSelectedFilters( filters: string) {
        return {};
    }

    getFiltersFromQueryParams( queryParams: string ) {
        return {};
    }

    toSelectedFilters() {
        return [];
    }
}
