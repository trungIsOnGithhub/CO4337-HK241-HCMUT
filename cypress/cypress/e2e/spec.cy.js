describe('template spec', () => {
  it('auto-passes', () => {
    cy.visit("/");
  })
})

describe('Login Test', () => {
  it('Login success and redirect', () => {
    cy.visit('/login');

    cy.get('[cytest]')
  });
});

describe('HomePage Test', () => {
  it('Successfully load after admin login - Header', () => {
    cy.visit("/");
    cy.get('[cytest="header_options"]').contains("Admin Workspace");
  });
});