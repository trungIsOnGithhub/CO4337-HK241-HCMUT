const credential = require('./credential');

describe('Test Example Template', () => {
  it('auto-passes', () => {
    cy.visit("/");
  })
})


// describe('Login Page Test', () => {
//   beforeEach('Init session manually', () => {
//     cy.visit("/login");
//   });
//   afterEach('Logout test session', () => {
//     // should be visible in any login
//     cy.visit("/logout");
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


// describe('Test: Book Service From Homepage:', () => {
//   before(() => {
//     cy.visit('/login');

//     cy.get('[cytest="email_input"]').type(credential.ADMIN_EMAIL_USERNAME_TEST_SUCCESS);
//     cy.get('[cytest="password_input"]').type(credential.ADMIN_PASSWORD_TEST_SUCCESS);

//     cy.get('[cytest="login_button"]').click();
//   });


//   it('Choose Service From Homepage', () => {
//     // pick first from list
//     cy.wait(1000);
//     cy.get('[cytest="book_srv_from_slider_idx_0"]').click();

//     cy.wait(1000);
//     cy.get('[cytest="timeslot_stff0_srv0"]').click();

//     // cy.scrollTo("topRight");
//     cy.wait(500);
//     cy.get('[name="booking_checkout_btn"]').click();
//   });

// });


// describe('Admin Add A New Staff:', () => {
//   before(() => {
//     cy.visit('/login');

//     cy.get('[cytest="email_input"]').type(credential.ADMIN_EMAIL_USERNAME_TEST_SUCCESS);
//     cy.get('[cytest="password_input"]').type(credential.ADMIN_PASSWORD_TEST_SUCCESS);

//     cy.get('[cytest="login_button"]').click();
//   });


//   it('Add Staff Success After Fail Missing Form Fields', () => {
//     // should be visible with any role
//     cy.get('[cytest="personal_icon"]').click();
//     // // should be visible login as admin
//     cy.get('[cytest="header_admin_options"]').click();

//     // // should be visible with any role
//     // // cy.get('[cytest="personal_icon"]').click();
//     // // // should be visible login as admin
//     // // cy.get('[cytest="header_admin_options"]').click();
//     const fieldNames = ['firstName', 'lastName', 'email', 'mobile'];
    
//     cy.visit('/admin/add_staff')
  
//     for (const name of fieldNames) {
//       cy.get(`[id="${name}"]`).type(credential.SAMPLE_STAFF_DATA[name]);
//     }

//     // cy.get('[cytest="add_new_staff_btn"]').click();
//     // failed to addm

//     cy.get('#avatar').selectFile('cypress/fixtures/example.json');
//     // cy.get('[cytest="add_new_staff_btn"]').click();
//     // // submit but wrong file format

//     cy.get('#firstName').should('have.value', credential.SAMPLE_STAFF_DATA.firstName);

//     // // Updload Images
//     cy.get('#avatar').selectFile('cypress/fixtures/example.png');

//     cy.get('[cytest="add_shift_for_staff_btn"]').click()

//     cy.get('[cytest="submit_staff_shift_changes_btn"]').click();

//     // if (cy.find('[cytest="exit_submit_staff_shift_btn"]').length > 0) {
//     //   cy.get('[cytest="exit_submit_staff_shift_btn"]').click();
//     // }

//     cy.wait(2000);
//     cy.get('[cytest="add_new_staff_btn"]').click();

//     cy.get('#firstName').should('not.have.value');
//   });
// });

describe('User Interact With Blog', () => {
  // login before all test
  before(() => {
    cy.visit('/login');

    cy.get('[cytest="email_input"]').type(credential.ADMIN_EMAIL_USERNAME_TEST_SUCCESS);
    cy.get('[cytest="password_input"]').type(credential.ADMIN_PASSWORD_TEST_SUCCESS);

    cy.get('[cytest="login_button"]').click();
  });


  it('Search Blog On Filter And View', () => {
    cy.visit("/blogs");

    cy.get('#q').type('cy8ey080840926v8mn9831zx7s988xa***w55##$');
    // this term search result in no post

    cy.get('[cytest="blog_item"').should('not.exists');

    cy.get('#q').type('dia diem');

    cy.get('[cytest="blog_item"').first().click()
  })

})
