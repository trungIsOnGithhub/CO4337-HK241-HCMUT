const credential = require('./credential');

// describe('Test Example Template', () => {
//   it('auto-passes', () => {
//     cy.visit("/");
//   })
// })

// describe('Login Page Test', () => {
//   beforeEach('Init session manually', () => {
//     cy.visit("/login");
//   });
//   afterEach('Logout test session', () => {
//     // should be visible in any login
//     cy.get('[cytest="personal_icon"]').click();
//     cy.get('[cytest="logout-btn"]').click();
//   })

//   it('Success load after admin login - Header', () => {
//     // cy.get('[cytest="header_options"]').contains("Admin Workspace");
//     cy.get('[cytest="email_input"]').type(credential.ADMIN_EMAIL_USERNAME_TEST_SUCCESS);
//     cy.get('[cytest="password_input"]').type(credential.ADMIN_PASSWORD_TEST_SUCCESS);

//     cy.get('[cytest="login_button"]').click();

//     cy.url().should('eq', `${Cypress.config().baseUrl}/`);

//     // should be visible with any role
//     cy.get('[cytest="personal_icon"]').click();
//     // should be visible login as admin
//     cy.get('[cytest="header_admin_options"]').click();
//   });

//   it('Success load after customer login - Header', () => {
//     // cy.get('[cytest="header_options"]').contains("Admin Workspace");
//     cy.get('[cytest="email_input"]').type(credential.CUSTOMER_EMAIL_USERNAME_TEST_SUCCESS);
//     cy.get('[cytest="password_input"]').type(credential.CUSTOMER_PASSWORD_TEST_SUCCESS);

//     cy.get('[cytest="login_button"]').click();

//     cy.url().should('eq', `${Cypress.config().baseUrl}/`);
  
//     // should be visible in any login
//     cy.get('[cytest="personal_icon"]').click();
//     // should be visible login as customer
//     cy.get('[cytest="header_personal_options"]').click();
//   });

//   it('Failed login', () => {
//     cy.get('[cytest="email_input"]').type('123asd');
//     cy.get('[cytest="password_input"]').type('123');

//     cy.get('[cytest="login_button"]').click();

//     cy.url().should('eq', `${Cypress.config().baseUrl}/login`);
//   });
// });


describe('Test: Book Service From Homepage:', () => {
  before(() => {
    cy.visit('/login');

    cy.get('[cytest="email_input"]').type(credential.ADMIN_EMAIL_USERNAME_TEST_SUCCESS);
    cy.get('[cytest="password_input"]').type(credential.ADMIN_PASSWORD_TEST_SUCCESS);

    cy.get('[cytest="login_button"]').click();
  });


  it('Choose Service From Homepage', () => {
    // pick first from list
    cy.wait(1000);
    cy.get('[cytest="book_srv_from_slider_idx_0"]').click();

    cy.wait(1000);
    cy.get('[cytest="timeslot_stff0_srv0"]').click();

    // cy.scrollTo("topRight");
    cy.wait(500);
    cy.get('[name="booking_checkout_btn"]').click();
  });

});


describe('Admin Add A New Staff:', () => {
  before(() => {
    cy.visit('/login');

    cy.get('[cytest="email_input"]').type(credential.ADMIN_EMAIL_USERNAME_TEST_SUCCESS);
    cy.get('[cytest="password_input"]').type(credential.ADMIN_PASSWORD_TEST_SUCCESS);

    cy.get('[cytest="login_button"]').click();
  });


  it('Switch to Admin Dashboard', () => {
    // should be visible with any role
    cy.get('[cytest="personal_icon"]').click();
    // should be visible login as admin
    cy.get('[cytest="header_admin_options"]').click();
  });

  it('Navigate to Admin Add Staff Menu', () => {
    // should be visible with any role
    // cy.get('[cytest="personal_icon"]').click();
    // // should be visible login as admin
    // cy.get('[cytest="header_admin_options"]').click();
    
    cy.visit('/admin/add_staff')
  });

  it('Fill Data In Add Staff Form', () => {
    const fieldNames = ['firstName', 'lastName', 'email', 'mobile'];

    for (const name in fieldNames) {
      cy.get(`#${name}`).type(credential.SAMPLE_STAFF_DATA[name]);
    }

    cy.get('[cytest="add_new_staff_btn"]').click;
    // unfilled data so this does not submit

    cy.get('#firsName').should('have.value', credential.SAMPLE_STAFF_DATA.firstName);
  });

  it('Try Upload Image File', () => {
    cy.get('#avatar').selectFile('example.json');
    cy.get('[cytest="add_new_staff_btn"]').click();
    // submit but wrong file format

    cy.get('#firsName').should('have.value', credential.SAMPLE_STAFF_DATA.firstName);

    cy.get('#avatar').selectFile('example.png');
    cy.get('[cytest="add_new_staff_btn"]').click();

    cy.get('#firsName').should('not.have.value');
  });
});