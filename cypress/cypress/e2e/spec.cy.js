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
    // should be visible in any login
    cy.get('[cytest="personal_icon"]').click();
    cy.get('[cytest="logout-btn"]').click();
  })

  it('Success load after admin login - Header', () => {
    // cy.get('[cytest="header_options"]').contains("Admin Workspace");
    cy.get('[cytest="email_input"]').type(credential.ADMIN_EMAIL_USERNAME_TEST_SUCCESS);
    cy.get('[cytest="password_input"]').type(credential.ADMIN_PASSWORD_TEST_SUCCESS);

    cy.get('[cytest="login_button"]').click();

    cy.url().should('eq', `${Cypress.config().baseUrl}/`);

    // should be visible with any role
    cy.get('[cytest="personal_icon"]').click();
    // should be visible login as admin
    cy.get('[cytest="header_admin_options"]').click();
  });

  it('Success load after customer login - Header', () => {
    // cy.get('[cytest="header_options"]').contains("Admin Workspace");
    cy.get('[cytest="email_input"]').type(credential.CUSTOMER_EMAIL_USERNAME_TEST_SUCCESS);
    cy.get('[cytest="password_input"]').type(credential.CUSTOMER_PASSWORD_TEST_SUCCESS);

    cy.get('[cytest="login_button"]').click();

    cy.url().should('eq', `${Cypress.config().baseUrl}/`);
  
    // should be visible in any login
    cy.get('[cytest="personal_icon"]').click();
    // should be visible login as customer
    cy.get('[cytest="header_personal_options"]').click();
  });

  it('Failed login', () => {
    cy.get('[cytest="email_input"]').type('123asd');
    cy.get('[cytest="password_input"]').type('123');

    cy.get('[cytest="login_button"]').click();

    cy.url().should('eq', `${Cypress.config().baseUrl}/login`);
  });
});


describe('Test Booking Services Scenario:', () => {
  before(() => {
    cy.visit('/login');

    cy.get('[cytest="email_input"]').type(credential.CUSTOMER_EMAIL_USERNAME_TEST_SUCCESS);
    cy.get('[cytest="password_input"]').type(credential.CUSTOMER_PASSWORD_TEST_SUCCESS);

    cy.get('[cytest="login_button"]').click();
  });


  it('Choose Service From Homepage', () => {
    // pick first from list
    cy.get('[cytest="0"]').click();
  });


  // it('Choose Service From Homepage', () => {
  //   // pick first from list
  //   cy.get('[cytest="0"]').click();
  // });
});
