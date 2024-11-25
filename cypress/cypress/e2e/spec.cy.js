const credential = require('./credential');

describe('Test Example Template', () => {
  it('auto-passes', () => {
    cy.visit("/");
  })
})

describe('Login Page Test', () => {
  beforeEach('Init session manually', () => {
    cy.visit("/login");
  });
  afterEach('Logout test session', () => {
    cy.get('[cytest=""]').contains('Sign out').click();
  })

  it('Success load after admin login - Header', () => {
    // cy.get('[cytest="header_options"]').contains("Admin Workspace");
    cy.get('[cytest="email_input"]').type(credential.ADMIN_EMAIL_USERNAME_TEST_SUCCESS);
    cy.get('[cytest="password_input"]').type(credential.ADMIN_PASSWORD_TEST_SUCCESS);

    cy.url().should('eq', `${Cypress.config().baseUrl}/`);
    cy.get();
  });

  it('Success load after customer login - Header', () => {
    // cy.get('[cytest="header_options"]').contains("Admin Workspace");
    cy.get('[cytest="email_input"]').type(credential.ADMIN_EMAIL_USERNAME_TEST_SUCCESS);
    cy.get('[cytest="password_input"]').type(credential.ADMIN_PASSWORD_TEST_SUCCESS);

    cy.url().should('eq', `${Cypress.config().baseUrl}/`);
    cy.get();
  });
});