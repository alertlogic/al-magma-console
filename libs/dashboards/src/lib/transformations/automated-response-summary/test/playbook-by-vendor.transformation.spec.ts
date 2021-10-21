import { ZeroStateReason } from '@al/ng-visualizations-components';
import { AlResponderPlaybookSummary } from '@al/responder';
import { playbookByVendor } from '../playbook-by-vendor.transformation';

describe('Playbook by vendor', () => {

  describe('when there are no results', () => {
    it('should return a zero state reason for no results', () => {
      const response: AlResponderPlaybookSummary = {};
      const config = playbookByVendor(response);

      expect(config).toEqual({
        nodata: true,
        reason: ZeroStateReason.Zero
      });
    });
  });

  describe('when there are results', () => {
    it('should return a the playbook types and counts', () => {
      const response: AlResponderPlaybookSummary =
      {
        "summary": {
          "playbook_vendors":[
            {"ServiceNow": 5},
            {"Slack": 1},
            {"Alert Logic": 26},
            {"Microsoft": 2},
            {"Zendesk": 3},
            {"AWS": 2},
            {"PagerDuty": 1},
            {"General Operation": 41},
            {"A 1": 3},
            {"B 2": 1},
            {"C 3": 1}
          ]
        }
      };

      const config = playbookByVendor(response);
      expect(config).toEqual({
        "dateOptions": [
          "General Operation",
          "Alert Logic",
          "ServiceNow",
          "Zendesk",
          "A 1",
          "Microsoft",
          "AWS",
          "Slack",
          "PagerDuty",
          "B 2"
        ],
        "description": "Playbooks Count",
        "inverted": true,
        "yAxisType": "linear",
        "tooltipString": "{{name}}: {{value}}",
        "series": [
          {
            "type": "column",
            "data": [
              {
                "y": 41,
                "className": "al-blue-500"
              },
              {
                "y": 26,
                "className": "al-blue-500"
              },
              {
                "y": 5,
                "className": "al-blue-500"
              },
              {
                "y": 3,
                "className": "al-blue-500"
              },
              {
                "y": 3,
                "className": "al-blue-500"
              },
              {
                "y": 2,
                "className": "al-blue-500"
              },
              {
                "y": 2,
                "className": "al-blue-500"
              },
              {
                "y": 1,
                "className": "al-blue-500"
              },
              {
                "y": 1,
                "className": "al-blue-500"
              },
              {
                "y": 1,
                "className": "al-blue-500"
              }
            ],
            "showInLegend": false
          }
        ]
      });
    });
  });
});
