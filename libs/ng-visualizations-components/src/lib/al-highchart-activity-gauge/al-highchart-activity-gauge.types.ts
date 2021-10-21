/*
 *
 */
export const BASE_CONFIG: any = {
    chart: {
        type: 'solidgauge',
        height: '68%',
        styledMode: true
    },
    title: {
        text: '',
    },

    pane: {
        startAngle: 0,
        endAngle: 360,
        background: [{
            outerRadius: '112%',
            innerRadius: '95%',
            backgroundColor: '',
            borderWidth: 0,
            className:'',
        }]
    },

    credits: {
        enabled: false
    },

    exporting: {
        enabled: false
    },

    tooltip: {
        headerFormat: '',
        shadow: false,
        useHTML: true,
        pointFormat: ``,
    },

    yAxis: {
        min: 0,
        max: 100,
        lineWidth: 0,
        tickPositions: []
    },

    plotOptions: {
        solidgauge: {
            linecap: 'round',
            stickyTracking: false,
            rounded: true,
            dataLabels: {
                enabled: true,
                y: -40,
                borderWidth: 0,
                backgroundColor: 'none',
                useHTML: true,
                shadow: false,
                formatter: null
            },
        },
    },

    series: [{
        name: 'Move',
        data: [{
            className: '',
            radius: '112%',
            innerRadius: '95%',
            y: 80
        }]
    }]
};
