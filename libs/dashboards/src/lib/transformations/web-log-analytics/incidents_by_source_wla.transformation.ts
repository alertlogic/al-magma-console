

import { Widget as WidgetConfig } from '@al/ng-visualizations-components';

enum Column {
    Country,
    City,
    Latitude,
    Longitude,
    GeoType,
    Count
}

const scaleValue = ( value, min, max ) => {
    const start = 5;
    const stop = 20;

    const scaledValue = start + (stop - start) * ((value - min) / (max - start));
    return Number(scaledValue).toFixed(1);
};

export const incidentsBySourceWla = (response: {rows: any[];}, item?: WidgetConfig) => {
    const config = { countries: [], cities: [] };
    let maxValue = 0;
    let minValue = 1;

    config.countries = response.rows.filter( row  => row[Column.GeoType] === "country").map( item => {
        maxValue = item[Column.Count] > maxValue ? item[Column.Count] : maxValue;
        minValue = item[Column.Count] < minValue ? item[Column.Count] : minValue;
    });

    config.countries = response.rows.filter( row  => row[Column.GeoType] === "country").map( item => {
        return {
            id: item[Column.Country],
            lat: Number(item[Column.Latitude]),
            lon: Number(item[Column.Longitude]),
            value: item[Column.Count],
            isCountry: true,
            className: 'source country',
            recordLink: {
                term: item[Column.Country],
                source: 'WLA',
                startDate: '<start_date_time>',
                endDate: '<end_date_time>'
            },
            marker: {
                radius: scaleValue(item[Column.Count], minValue, maxValue)
            }
        };
    });
    config.cities = response.rows.filter( row  => row[Column.GeoType] === "city").map( item => {
        return {
            id: item[Column.City],
            lat: Number(item[Column.Latitude]),
            lon: Number(item[Column.Longitude]),
            value: item[Column.Count],
            isCountry: false,
            className: 'source city',
            recordLink: {
                term: item[Column.City],
                source: 'WLA',
                startDate: '<start_date_time>',
                endDate: '<end_date_time>'
            },
            marker: {
                radius: scaleValue(item[Column.Count], minValue, maxValue),
                symbol: 'circle'
            }
        };
    });
    return config;
};
