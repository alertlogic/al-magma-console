import {login} from '../../support';
import selectors from '../../support/selectors';

describe( 'Test Suite for Exposures List Search Functionality in Exposure app', () => {
    let exposureName: string = '';
    before(() => {
        login('configui@alertlogic.com', 'exposure-management/exposures/open/:accountId');
    });

    describe("When searching the open exposures list with the first exposure's title", () => {
        it('Should be able to filter searched term and view detailed record', () => {
            cy.get(selectors.cardstackFilters).contains('Open').click();
            cy.get(selectors.cardstackItemTitle).its('length').should('be.greaterThan', 0);
            cy.get(selectors.cardstackItemTitle)
                .first()
                .invoke('text')
                .then((text) => {
                    exposureName = text.trim();
                    cy.get(selectors.cardstackSearch).type(exposureName);
                    cy.url().should('include', encodeURIComponent(exposureName));
                    cy.get(selectors.cardstackItemContents).first().get(selectors.cardstackItemMaterialButton).first().click();
                    cy.get(selectors.detailViewHeader).should('be.visible');
                    cy.get(selectors.detailViewHeader).should('have.text', exposureName);
                });
        });
    });
});
