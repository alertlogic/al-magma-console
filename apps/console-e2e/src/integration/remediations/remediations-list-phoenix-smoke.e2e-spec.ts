import { login } from '../../support';
import selectors from '../../support/selectors';

describe(`SUITE for Remediation List in Exposure app`, {scrollBehavior: false}, () => {

    before(() => {
        login('configui@alertlogic.com', 'exposure-management/exposures/open/:accountId');
    });

    describe('When selecting the Open state', () => {

        it('Should display Open in the cardstack header', () => {
            cy.get(selectors.cardstackFilters).contains('Open').click();
            cy.get('p-dropdown.viewBy').click();
            cy.get('p-dropdownitem li').first().click();
            cy.url().should('include', '/remediations/open');
            cy.get(selectors.cardstackTitle).should('have.text', 'Open');
        });
        it('should be able to expand a card item to reveal more content', () => {
            cy.get(selectors.cardstackItems).its('length').should('be.greaterThan', 0);
            cy.get(selectors.cardstackItemExpand).first().click({force: true});
            cy.get(selectors.cardstackItemExpanded).its('length').should('eq', 1);
        });

        describe('and viewing the remediation details', () => {
            it('should be able to dispose the item', () => {
                cy.get(selectors.cardstackItemOpen).first().click({force: true});
                //cy.scrollTo(0, 0);
                cy.get('p-checkbox').first().click();
                cy.get(selectors.detailViewActionButtons)
                    .get('al-icon-block')
                    .first()
                    .click();
                cy.get('.al-exposure-dispose button > span').contains('Dispose').click();
                // cy.get(selectors.cardstackTitle).should('be.visible');
                // cy.url().should('include', '/remediations/open');
                cy.get(selectors.cardstackLoading).should('be.visible');
                    cy.get(selectors.cardstackLoading).should('not.exist');
                cy.get(selectors.cardstackTitle).should('have.text', 'Open');
            });

            describe('and viewing the disposed item', () => {
                it('should be able to restore the item', () => {
                    //cy.scrollTo(0, 0);
                    cy.get(selectors.cardstackFilters).contains('Disposed').click();
                    cy.get(selectors.cardstackLoading).should('be.visible');
                    cy.get(selectors.cardstackLoading).should('not.exist');
                    cy.url().should('include', '/remediations/disposed');
                    cy.get(selectors.cardstackItemContents).first().get(selectors.cardstackItemMaterialButton).first().click({force: true});
                    cy.get(selectors.detailViewActionButtons).should('be.visible');
                    cy.get(selectors.detailViewActionButtons)
                        .get('al-icon-block')
                        .first()
                        .click();
                    cy.get(selectors.cardstackTitle).should('have.text', 'Disposed');
                });
            });
        });
    });
});
