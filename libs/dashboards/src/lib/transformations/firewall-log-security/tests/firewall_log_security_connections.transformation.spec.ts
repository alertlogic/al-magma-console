import { firewallSecurityOutboundConnections } from '../firewall_log_security_connections.transformation';
import { TableListConfig } from '@al/ng-visualizations-components';


describe('Firewall Log Security Connections Transformation Test Suite:', () => {
  describe('When transforming a kalm response containing denied outbound connection entries', () => {
    it('should generate a correctly constructed TableListConfig object', () => {
      const response = {
        rows: [
          ["172.24.32.40", 0, 463]
        ]
      };
      expect(firewallSecurityOutboundConnections(response)).toEqual({
        headers: [{
          name: "Source",
          field: "source",
          class: "left"
        },
        {
          name: "Denied Connections",
          field: "denied",
          class: "right"
        }],
        body: [{
          source: "172.24.32.40",
          denied: 0
        }]
      } as TableListConfig);
    });
  });
});
