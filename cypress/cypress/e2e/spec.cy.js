const credential = require('./credential');

describe('template spec', () => {
  it('auto-passes', () => {
    cy.visit("/");
  })
})

// describe('Login Test', () => {
//   it('Login success and redirect', () => {
//     cy.visit('/login');

//     cy.get('[cytest]')
//   });
// });

describe('HomePage Test', () => {
  it('Successfully load after admin login - Header', () => {
    cy.visit("/login");
    // cy.get('[cytest="header_options"]').contains("Admin Workspace");
    cy.get('[cytest="email_input"]').type(credential.EMAIL_USERNAME_SUCCESS);
    cy.get('[cytest="password_input"]').type(credential.PASSWORD_SUCCESS);

    cy.get('[cytest="login_button"]').contains('Login').click()

    cy.url().should('eq', `${Cypress.config().baseUrl}/`);
  });
});