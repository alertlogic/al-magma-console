
import {
    AlCardstackCharacteristics,
    AlCardstackView,
} from '@al/core';

export const mockCharacteristics = require('../testing/mocks/al-cardstack-characteristics.json');
mockCharacteristics.toolbarConfig ={ 
    viewBy : {}
};
export const dummyColors = [
    {
        value: 'red',
        caption: 'Red',
        count: 4344,
    },
    {
        value: 'green',
        caption: 'Green',
        count: 1256,
    },
    {
        value: 'blue',
        caption: 'Blue',
        count: 56565,
    },
    {
        value: 'purple',
        caption: 'Purplepink',
        count: 888,
    },
    {
        value: 'deep_black',
        caption: 'Infinite Night',
        count: 56,
    },
];
export const dummyShapes = [
    {
        value: '291AA850-D2DD-4654-8FFC-F7F58C632E3A',
        caption: 'Flat',
    },
    {
        value: 'D7F55EC3-7C96-43DB-8CDD-93E6F73056BD',
        caption: 'Short',
    },
    {
        value: '35F26B47-3874-4EDB-B652-5477E106701B',
        caption: 'Round',
    },
    {
        value: '0CD649EA-9957-486C-80D1-B2369AE61AEC',
        caption: 'Rotund',
    },
    {
        value: 'FFB41233-CFE7-4CF1-B3B3-955C0E823ED8',
        caption: 'Obese',
    },
    {
        value: '0C939A6A-A2D7-4372-A163-FCA3593B126A',
        caption: 'Dodecahedral',
    },
    {
        value: '291D2048-9100-4F3F-B56B-96965684ECAD',
        caption: 'Extradimensional',
    },
];


export class DummyModel {
    entityId: string;
    displayName: string;
    colorId: string;
    shapeId: string;
    created: {
        by: string;
        at: number;
    };
    unitCount: number;
}

export interface DummyProperties {
    id: string;
    caption: string;
    color: string;
    shape: string;
    date_created: number;
    size: number;
}

export class DummyCardstack extends AlCardstackView<DummyModel, DummyProperties> {
    public count: number = 0;

    constructor(cod: boolean = true) {
        super(cod ? mockCharacteristics as AlCardstackCharacteristics : undefined);
    }

    oneOf(list: any[]): any {
        return list[Math.floor(Math.random() * list.length)];
    }

    async fetchData() {
        const results: DummyModel[] = [];
        for (let i = 0; i < 20; i++) {
            this.count++;
            const color = this.oneOf(dummyColors);
            const shape = this.oneOf(dummyShapes);
            const model = new DummyModel();
            model.entityId = this.count.toString();
            model.displayName = `Dummy #${this.count}`;
            model.colorId = color.value;
            model.shapeId = shape.value;
            model.created = {
                by: 'user 10101000101111',
                at: 1505672016 + Math.floor(Math.random() * 500000),
            };
            model.unitCount = Math.floor(1 + (Math.random() * 9));
            results.push(model);
        }
        return results;
    }

    async generateCharacteristics() {
        return mockCharacteristics as AlCardstackCharacteristics;
    }

    deriveEntityProperties(entity: DummyModel) {
        return {
            id: entity.entityId,
            caption: entity.displayName,
            color: entity.colorId,
            shape: entity.shapeId,
            date_created: entity.created.at,
            size: entity.unitCount,
        };
    }
}
