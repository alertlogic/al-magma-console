import {
  camelCaseToWords,
  getTotalForKeys,
  highlightSeverity,
  highlightValue,
  highlightRiskLevel,
  filterTopAccountCountRecords,
  extractObjectValueByPath,
  countByTopAccounts} from './transformation.utilities';
import { AccountCount } from '../dashboards.types';
import { ThreatLevelCountSummary } from './kalm.named_query_response.types';
import {type} from 'os';
import {ZeroStateReason} from '@al/ng-visualizations-components';

describe('Transformation Utilities Test Suite: ', () => {
  describe('when suppying a string value of "fooBar" to camelCaseToWords()', () => {
    it('should return a value of "Foo Bar"', ()=> {
      expect(camelCaseToWords('fooBar')).toEqual('Foo Bar');
    });
  });
  describe('given an object containing severity counts', () => {
    const threatLevelCountSummary: ThreatLevelCountSummary = {
      High: 5,
      Medium: 6,
      Low: 20
    };
    describe('and using getTotalForKeys for High and Medium keys', () => {
      it('should return the correct total of High and Medium counts combined', () => {
        expect(getTotalForKeys(threatLevelCountSummary, ['High', 'Medium'], )).toEqual(11);
      });
    });
    describe('and using getTotalForKeys for High and a non existent Foo key', () => {
      it('should return the value of High count', () => {
        expect(getTotalForKeys(threatLevelCountSummary, ['High', 'Foo'],)).toEqual(5);
      });
    });
    describe('and using totalSeverityCounts for a sum of all severities', () => {
      it('should return the total value across all keys', () => {
        expect(getTotalForKeys(threatLevelCountSummary)).toEqual(31);
      });
    });
  });
  describe('When determining what css class to apply for a Threat Level Summary object', () => {
    describe('which contains no critical, high or medium counts', () => {
      const threatLevelCountSummary: ThreatLevelCountSummary = {
        Critical: 0,
        High: 0,
        Medium: 0
      };
      it('should return an empty string', () => {
        expect(highlightSeverity(threatLevelCountSummary)).toEqual('');
      });
    });
    describe('which contains a non zero Critical count', () => {
      const threatLevelCountSummary: ThreatLevelCountSummary = {
        Critical: 5,
        High: 6,
        Medium: 20
      };
      it('should return a string value of "highlight critical"', () => {
        expect(highlightSeverity(threatLevelCountSummary)).toEqual('highlight critical');
      });
    });
    describe('which contains a zero Critical count and non zero High count', () => {
      const threatLevelCountSummary: ThreatLevelCountSummary = {
        Critical: 0,
        High: 6,
        Medium: 20
      };
      it('should return a string value of "highlight high"', () => {
        expect(highlightSeverity(threatLevelCountSummary)).toEqual('highlight high');
      });
    });
    describe('which contains a zero Critical and High count and a non zero Medium count', () => {
      const threatLevelCountSummary: ThreatLevelCountSummary = {
        Critical: 0,
        High: 0,
        Medium: 20
      };
      it('should return a string value of "highlight medium"', () => {
        expect(highlightSeverity(threatLevelCountSummary)).toEqual('highlight medium');
      });
    });
    describe('and critical scaling should be used', () => {
      describe('which contains a non zero Critical count', () => {
        const threatLevelCountSummary: ThreatLevelCountSummary = {
          Critical: 5,
          High: 6,
          Medium: 20
        };
        it('should return a string value of "highlight risk-critical"', () => {
          expect(highlightSeverity(threatLevelCountSummary, true)).toEqual('highlight risk-critical');
        });
      });
      describe('which contains a zero Critical count and non zero High count', () => {
        const threatLevelCountSummary: ThreatLevelCountSummary = {
          Critical: 0,
          High: 6,
          Medium: 20
        };
        it('should return a string value of "highlight risk-high"', () => {
          expect(highlightSeverity(threatLevelCountSummary, true)).toEqual('highlight risk-high');
        });
      });
      describe('which contains a zero Critical and High count and a non zero Medium count', () => {
        const threatLevelCountSummary: ThreatLevelCountSummary = {
          Critical: 0,
          High: 0,
          Medium: 20
        };
        it('should return a string value of "highlight risk-medium"', () => {
          expect(highlightSeverity(threatLevelCountSummary, true)).toEqual('highlight risk-medium');
        });
      });
    });
  });

  /*
   *
   */
  describe('When determining how to highlight a given value', () => {
    const thresholds = {
      high: 30,
      medium: 20,
      low: 10,
      acceptable: 5
    };

    describe('with a value of 30 and a threshold for "high" set at 30', () => {
      it('should return a string value of "highlight high"', () => {
        expect(highlightValue(30, thresholds)).toEqual('highlight high');
      });
    });

    describe('with a value of 20 and a threshold for "medium" set at 20', () => {
      it('should return a string value of "highlight medium"', () => {
        expect(highlightValue(20, thresholds)).toEqual('highlight medium');
      });
    });

    describe('with a value of 10 and a threshold for "low" set at 10', () => {
      it('should return a string value of "highlight low"', () => {
        expect(highlightValue(10, thresholds)).toEqual('highlight low');
      });
    });

    describe('with a value of 5 and a threshold for "acceptable" set at 5', () => {
      it('should return a string value of "highlight acceptable"', () => {
        expect(highlightValue(5, thresholds)).toEqual('highlight acceptable');
      });
    });

    describe('with a value of 4 and a threshold for "acceptable" set at 5', () => {
      it('should default to a string value of "highlight acceptable"', () => {
        expect(highlightValue(4, thresholds)).toEqual('highlight acceptable');
      });
    });
  });

  /*
   *
   */
  describe('When determining how to highlight a given value against reversed values', () => {
    const thresholds = {
      high: 5,
      medium: 10,
      low: 20,
      acceptable: 30
    };

    describe('with a value of 30 and a threshold for "acceptable" set at 30', () => {
      it('should return a string value of "highlight acceptable"', () => {
        expect(highlightValue(30, thresholds, true)).toEqual('highlight acceptable');
      });
    });

    describe('with a value of 20 and a threshold for "low" set at 20', () => {
      it('should return a string value of "highlight low"', () => {
        expect(highlightValue(20, thresholds, true)).toEqual('highlight low');
      });
    });

    describe('with a value of 10 and a threshold for "medium" set at 10', () => {
      it('should return a string value of "highlight medium"', () => {
        expect(highlightValue(10, thresholds, true)).toEqual('highlight medium');
      });
    });

    describe('with a value of 5 and a threshold for "high" set at 5', () => {
      it('should return a string value of "highlight acceptable"', () => {
        expect(highlightValue(5, thresholds, true)).toEqual('highlight high');
      });
    });

    describe('with a value of 4 and a threshold for "high" set at 5', () => {
      it('should default to a string value of "highlight acceptable"', () => {
        expect(highlightValue(4, thresholds, true)).toEqual('highlight acceptable');
      });
    });
  });

  /*
   *
   */
  describe('When determining how to highlight a risk level', () => {
    describe('with a value of 1', () => {
      it('should return a string value of "highlight risk-low"', () => {
        expect(highlightRiskLevel(1)).toEqual('highlight risk-low');
      });
    });
    describe('with a value of 2', () => {
      it('should return a string value of "highlight risk-medium"', () => {
        expect(highlightRiskLevel(2)).toEqual('highlight risk-medium');
      });
    });
    describe('with a value of 3', () => {
      it('should return a string value of "highlight risk-high"', () => {
        expect(highlightRiskLevel(3)).toEqual('highlight risk-high');
      });
    });
    describe('with a value of 4', () => {
      it('should return a string value of "highlight risk-critical"', () => {
        expect(highlightRiskLevel(4)).toEqual('highlight risk-critical');
      });
    });
    describe('with a value of 10', () => {
      it('should return an empty string value', () => {
        expect(highlightRiskLevel(10)).toEqual('');
      });
    });
  });

  /*
   *
   */
  describe('when extracting a value from an object by a path identifier', () => {
    describe('with an object {prop1: 1} and a path "prop1"', () => {
      it('should return a value of 1', () => {
        const obj = { prop1: 1 };
        const path = 'prop1';
        expect(extractObjectValueByPath(obj, path)).toEqual(1);
      });
    });

    describe('with an object { prop1: { prop2: 2 } } and a path "prop1.prop2"', () => {
      it('should return a value of 2', () => {
        const obj = { prop1: { prop2: 2 } };
        const path = 'prop1.prop2';
        expect(extractObjectValueByPath(obj, path)).toEqual(2);
      });
    });

    describe('with an object { prop1: { prop2: ["a", "b"] } } and a path "prop1.prop2.0"', () => {
      it('should return a value of "a"', () => {
        const obj = { prop1: { prop2: ['a', 'b'] } };
        const path = 'prop1.prop2.0';
        expect(extractObjectValueByPath(obj, path)).toEqual('a');
      });
    });

    describe('with an object { prop1: { prop2: [{ prop3: 3 }, "b"] } } and a path "prop1.prop2.0.prop3"', () => {
      it('should return a value of "a"', () => {
        const obj = { prop1: { prop2: [{ prop3: 3 }, 'b'] } };
        const path = 'prop1.prop2.0.prop3';
        expect(extractObjectValueByPath(obj, path)).toEqual(3);
      });
    });

    describe('with an object { prop1: { prop2: 2 } } and a invalid path "prop4.prop2"', () => {
      const obj = { prop1: { prop2: 2 } };
      const path = 'prop4.prop2';

      it('should return a value of null when no default value is passed in', () => {
        expect(extractObjectValueByPath(obj, path)).toBeNull();
      });

      it('should return a value of 99 when a default value of 99 is passed in', () => {
        expect(extractObjectValueByPath(obj, path, 99)).toEqual(99);
      });
    });
  });

  /*
   *
   */
  describe('when creating a chart object based on a set of supplied rows', () => {
    let baseRows: any[] = [];
    let baseExpectedResponse: any = {};
    const noData = {
      nodata: true,
      reason: ZeroStateReason.Zero
    };

    beforeEach(() => {
      baseRows = [
        [
          134241351,
          "SRE UI - Assess Only",
          { "vulnerability": 0, "tri": 0, "remediation": 0, "incident": 0 },
          { "vulnerability": { "Medium": 9, "Low": 1, "Info": 3, "High": 0 },
            "tri": { "Severity": 4, "Score": 61.5 },
            "remediation": { "Open": 7 },
            "incident": { "Info": 0, "High": 0, "Critical": 0 }
          }
        ],
        [
          134231947,
          "SRE UI - Detect Only",
          { "vulnerability": 1, "tri": 0, "remediation": 0, "incident": 0 },
          { "vulnerability": { "Medium": 9, "Low": 1, "Info": 3, "High": 0 },
            "tri": { "Severity": 2, "Score": 5.8 },
            "remediation": { "Open": 7 },
            "incident": { "Info": 0, "High": 0, "Critical": 0 }
          }
        ],
        [
          134234927,
          "SRE UI - Respond Only",
          { "vulnerability": 0, "tri": 0, "remediation": 0, "incident": 0 },
          { "vulnerability": { "Medium": 4, "Low": 0, "Info": 3, "High": 0 },
            "tri": { "Severity": 1, "Score": 2.8 },
            "remediation": { "Open": 7 },
            "incident": { "Info": 0, "High": 0, "Critical": 50 }
          }
        ]
      ];

      baseExpectedResponse = {
        dateOptions: ['SRE UI - Assess Only', 'SRE UI - Detect Only', 'SRE UI - Respond Only'],
        description: "Count of Remediations",
        inverted: true,
        yAxisType: 'linear',
        tooltipString: '{{name}}: {{value}} {{newline}} Total: 21 {{newline}} % of Total: {{%total[21]}}%',
        series: [{
          type: 'column',
          showInLegend: false,
          data: [
            { "y": 7, "recordLink": { "aaid": "134241351" }, "className": "al-blue-400" },
            { "y": 7, "recordLink": { "aaid": "134231947" }, "className": "al-blue-400" },
            { "y": 7, "recordLink": { "aaid": "134234927" }, "className": "al-blue-400" }
          ]
        }]
      };
    });

    describe('and it is based on counts', () => {
      it('should return the expected response for the passed in rows object', () => {
        expect(countByTopAccounts(baseRows, 'remediation', 'Count of Remediations')).toEqual(baseExpectedResponse);
      });

      it('should return the expected response for the passed in rows object', () => {
        expect(countByTopAccounts(baseRows, 'remediation', 'Count of Remediations')).toEqual(baseExpectedResponse);
      });

      it('should return zero state reason for no value', () => {
        baseRows.forEach((row) => {
          row[3]['remediation']['Open'] = 0;
        });
        expect(countByTopAccounts(baseRows, 'remediation', 'Count of Remediations')).toEqual(noData);
      });
    });
  });

  describe('When filtering 12 top account count records', () => {
    describe('with some zero value present', () => {
      const accountCounts: AccountCount[] = [
        {accountId: '1', accountName: 'a', count: 1},
        {accountId: '2', accountName: 'b', count: 2},
        {accountId: '3', accountName: 'c', count: 3},
        {accountId: '4', accountName: 'd', count: 4},
        {accountId: '5', accountName: 'e', count: 0},
        {accountId: '6', accountName: 'f', count: 6},
        {accountId: '7', accountName: 'g', count: 7},
        {accountId: '8', accountName: 'h', count: 0},
        {accountId: '9', accountName: 'i', count: 9},
        {accountId: '10', accountName: 'j', count: 10},
        {accountId: '11', accountName: 'k', count: 11},
        {accountId: '12', accountName: 'l', count: 12}
      ];
      it('should return a maximum of 10 accounts, sorted in descending count order', () => {
        expect(filterTopAccountCountRecords(accountCounts)).toEqual(
          [
            {accountId: '12', accountName: 'l', count: 12},
            {accountId: '11', accountName: 'k', count: 11},
            {accountId: '10', accountName: 'j', count: 10},
            {accountId: '9', accountName: 'i', count: 9},
            {accountId: '7', accountName: 'g', count: 7},
            {accountId: '6', accountName: 'f', count: 6},
            {accountId: '4', accountName: 'd', count: 4},
            {accountId: '3', accountName: 'c', count: 3},
            {accountId: '2', accountName: 'b', count: 2},
            {accountId: '1', accountName: 'a', count: 1}
          ]
        );
      });
      describe('limited to 5 records returned', () => {
        it('should return a maximum of 5 accounts, sorted in descending count order', () => {
          expect(filterTopAccountCountRecords(accountCounts,5)).toEqual(
            [
              {accountId: '12', accountName: 'l', count: 12},
              {accountId: '11', accountName: 'k', count: 11},
              {accountId: '10', accountName: 'j', count: 10},
              {accountId: '9', accountName: 'i', count: 9},
              {accountId: '7', accountName: 'g', count: 7}
            ]
          );
        });
      });
    });
  });
});

