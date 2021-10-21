import { AlFilterListPipe } from "./al-filter-list.pipe";
import { SearchableItem } from "../types";

describe('AlFilterListPipe', () => {

    class MyItem implements SearchableItem {
        id: number;
        searchableVals: (string | number)[];
    }

    const pipe = new AlFilterListPipe();
    const data: MyItem[] = [
        {
            id: 1,
            searchableVals: ['hola', 'mundo']
        },
        {
            id: 2,
            searchableVals: ['hello', 'world']
        },
        {
            id: 3,
            searchableVals: ['Olá', 'mundo']
        },
        {
            id: 4,
            searchableVals: ['one', 2, 'three' ]
        }
    ];
    it('should work', () => {
        let filteredList:  MyItem[] = pipe.transform(data, 'mundo');
        expect(filteredList.length).toBe(2);
        expect(filteredList[0]['id']).toBe(1);
        expect(filteredList[1]['id']).toBe(3);

        filteredList  = pipe.transform(data, 'world');
        expect(filteredList.length).toBe(1);
        expect(filteredList[0]['id']).toBe(2);

        filteredList  = pipe.transform(data, 2);
        expect(filteredList.length).toBe(1);
        expect(filteredList[0]['id']).toBe(4);

        filteredList  = pipe.transform(data, 'x');
        expect(filteredList.length).toBe(0);
    });
});

