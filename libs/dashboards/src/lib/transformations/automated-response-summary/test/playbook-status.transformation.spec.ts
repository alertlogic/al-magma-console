import { ZeroStateReason } from '@al/ng-visualizations-components';
import { AlResponderPlaybook } from '@al/responder';
import { playbookStatus } from '../playbook-status.transformation';

describe('Playbook status', () => {

  describe('when there are no results', () => {
    it('should return a zero state reason for no results', () => {
      const response: AlResponderPlaybook[] = [];
      const config = playbookStatus(response);

      expect(config).toEqual({
        nodata: true,
        reason: ZeroStateReason.Zero
      });
    });
  });

  describe('when there are results', () => {
    it('should return a the playbook status and counts', () => {
      const response: AlResponderPlaybook[] = [
        {
          id: "1",
          name: "A",
          type: 'incident',
          enabled: true,
        },
        {
          id: "2",
          name: "B",
          type: 'incident',
          enabled: false,
        },
        {
          id: "3",
          name: "C",
          type: 'incident',
          enabled: true,
        },
      ];

      const config = playbookStatus(response);
      expect(config.series[0].data).toEqual([
        {
          "name": "Active",
          "y": 2,
          "className": "healthy",
          "recordLink": {
            "enabled": true
          }
        },
        {
          "name": "Inactive",
          "y": 1,
          "className": "unhealthy",
          "recordLink": {
            "enabled": false
          }
        }
      ]);
    });
  });
});
