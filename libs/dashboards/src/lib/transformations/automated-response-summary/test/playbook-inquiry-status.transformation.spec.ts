import { ZeroStateReason } from '@al/ng-visualizations-components';
import { AlResponderInquiries } from '@al/responder';
import { playbookInquiryStatus } from '../playbook-inquiry-status.transformation';

describe('Playbook inquiry', () => {

  describe('when there are no results', () => {
    it('should return a zero state reason for no results', () => {
      const response: AlResponderInquiries = {
        executions: [],
        summary: {
          statuses: [
          ]
        }
      };

      const config = playbookInquiryStatus(response);

      expect(config).toEqual({
        nodata: true,
        reason: ZeroStateReason.Zero
      });
    });

    it('when we have status but do not match with the expected should return a zero state reason for no results', () => {
      const response: AlResponderInquiries = {
        executions: [],
        summary: {
          statuses: [
            { "other": 34 }, { "paused": 9 }
          ]
        }
      };

      const config = playbookInquiryStatus(response);

      expect(config).toEqual({
        nodata: true,
        reason: ZeroStateReason.Zero
      });
    });
  });

  describe('when there are results', () => {
    it('should return a the playbook status and counts', () => {
      const response: AlResponderInquiries = {
        executions: [],
        summary: {
          statuses: [
            { 'succeeded': 2 }, { "pending": 34 }, { "failed": 9 }
          ]
        }
      };
      const config = playbookInquiryStatus(response);
      expect(config.series[0].data).toEqual(
        [
          {
            "name": "Succeeded",
            "y": 2,
            "className": "al-green-500",
            "recordLink": {
              "statuses": "succeeded",
              "startDate": '<start_date_time>',
              "endDate": '<end_date_time>'
            }
          },
          {
            "name": "Pending",
            "y": 34,
            "className": "al-orange-500",
            "recordLink": {
              "statuses": "pending",
              "startDate": '<start_date_time>',
              "endDate": '<end_date_time>'
            }
          },
          {
            "name": "Failed",
            "y": 9,
            "className": "al-red-500",
            "recordLink": {
              "statuses": "failed",
              "startDate": '<start_date_time>',
              "endDate": '<end_date_time>'
            }
          }
        ]
      );
    });
  });
});
