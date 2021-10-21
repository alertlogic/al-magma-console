

import { Widget as WidgetConfig } from '@al/ng-visualizations-components';

enum Column {
    HostName,
    AttackerCountry,
    AttackerCity,
    AttackerLatitude,
    AttackerLongitude,
    VictimCountry,
    VictimCity,
    VictimLatitude,
    VictimLongitude,
    Attacks
}

export const incidentsByTarget = (response: {rows: any[];}, item?: WidgetConfig) => {
    const config = response.rows.map( row  => {
        const victimName = row[Column.VictimCity] || row[Column.VictimCountry];

        return {
            id:  victimName,
            lat: Number(row[Column.VictimLatitude]),
            lon: Number(row[Column.VictimLongitude]),
            value: row[Column.Attacks],
            className: 'target',
            marker: {
                radius: row[Column.Attacks] + 5
            }
        };
    });
    return config;
};
