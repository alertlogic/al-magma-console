import * as Transformation from '../ten_most_attacked_deployments.transformation';

describe('Top ten most attacked deployments', () => {
  describe('when there are results', () => {
    let baseResponse: {};
    let baseConfig: any = {};

    beforeEach(() => {
      baseResponse = {
        "aggregations": {
          "createtime_str": {
            "date_period": {
              "assets.al__deployment": {
                "Dashboards UI Dev3": {
                  "count": 46,
                  "incident.threatRating": {
                    "Medium": 46
                  }
                },
                "Manual deployment": {
                  "count": 9,
                  "incident.threatRating": {
                    "Medium": 9
                  }
                }
              },
              "count": 55,
              "end_date": "2019-09-20T16:22:47.000Z",
              "from": 1565481600000.0,
              "start_date": "2019-08-11T00:00:00.000Z",
              "to": 1568996567000.0
            }
          }
        },
        "results": [],
        "took": 9,
        "total": 126
      };

      baseConfig = {
        title: '',
        description: 'Count of Incidents',
        dateOptions: ['Dashboards UI Dev3', 'Manual deployment'],
        series: [{
          name: 'Medium',
          data: [
            {x: 0, y: 46, recordLink: {threat: 'Medium', 'deployment': 'Dashboards UI Dev3'}},
            {x: 1, y: 9, recordLink: {threat: 'Medium', 'deployment': 'Manual deployment'}}
          ],
          className: 'low',
          legendIndex: 2
        }]
      };
    });

    it('should pass back the expected config', () => {
      const config: any = Transformation.tenMostAttackedDeployments(baseResponse);
      expect(config).toEqual(baseConfig);
    });
  });
});

