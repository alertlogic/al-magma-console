import {login} from '../../support';
import selectors from '../../support/selectors';

describe( 'Test Suite for Exposures List in Exposure app', () => {
    before(() => {
        login('configui@alertlogic.com', 'exposure-management/exposures/open/:accountId');
    });

    describe('When navigating to Open Exposures', () => {
        it( 'Should display Open in the cardstack header', () => {
            cy.get(selectors.cardstackFilters).contains('Open').click();
            cy.get(selectors.cardstackTitle).should('have.text', 'Open');
        });
        it('should be able to expand card items if results are returned', () => {
            cy.get(selectors.cardstackItems).its('length').should('be.greaterThan', 0);
            cy.get(selectors.cardstackItemExpand).first().click({force: true});
            cy.get(selectors.cardstackItemExpanded).its('length').should('eq', 1);
        });
        describe('and viewing the exposures details', () => {
            it('should display the same exposure name as was shown on the previous summary screen', () => {
                let exposureName: string;
                cy.get(selectors.cardstackItemTitle).first().invoke('text').then((text) => {
                    exposureName = text.trim();
                    cy.get(selectors.cardstackItemOpen).first().click({force: true});
                    cy.scrollTo(0,0);
                    cy.get(selectors.detailViewHeader).should('include.text', exposureName);
                });
            });
        });
    });
});
