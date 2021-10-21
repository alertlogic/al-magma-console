import { ZeroStateReason } from '@al/ng-visualizations-components';
import { AlResponderPlaybook } from '@al/responder';
import { playbookTypes } from '../playbook-types.transformation';

describe('Playbook types', () => {

  describe('when there are no results', () => {
    it('should return a zero state reason for no results', () => {
      const response: AlResponderPlaybook[] = [];
      const config = playbookTypes(response);

      expect(config).toEqual({
        nodata: true,
        reason: ZeroStateReason.Zero
      });
    });
  });

  describe('when there are results', () => {
    it('should return a the playbook types and counts', () => {
      const response: AlResponderPlaybook[] = [
        {
          id: "1",
          type: 'incident',
          enabled: true,
        },
        {
          id: "2",
          type: 'observation',
          enabled: false,
        },
        {
          id: "3",
          type: 'incident',
          enabled: true,
        },
        {
          id: "4",
          type: 'generic',
          enabled: true,
        },
      ];

      const config = playbookTypes(response);
      expect(config).toEqual({
        "title": "",
        "yAxisType": "linear",
        "dateOptions": [
          "Incident",
          "Observation",
          "Generic"
        ],
        "series": [
          {
            "name": "",
            "showInLegend": false,
            "data": [
              {
                "name": "Incident",
                "y": 2,
                "className": 'al-blue-500',
                "recordLink": {
                  "type": "incident"
                }
              },
              {
                "name": "Observation",
                "y": 1,
                "className": 'al-blue-500',
                "recordLink": {
                  "type": "observation"
                }
              },
              {
                "name": "Generic",
                "y": 1,
                "className": 'al-blue-500',
                "recordLink": {
                  "type": "generic"
                }
              }
            ]
          }
        ]
      });
    });
  });
});
