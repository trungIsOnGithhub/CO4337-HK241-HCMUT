Cypress.config('viewportWidth', 1224);
Cypress.config('viewportHeight', 860);

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

// describe('User Interact With Blog', () => {
//   // login before all test
//   before(() => {
//     cy.visit('/login');

//     cy.get('[cytest="email_input"]').type(credential.ADMIN_EMAIL_USERNAME_TEST_SUCCESS);
//     cy.get('[cytest="password_input"]').type(credential.ADMIN_PASSWORD_TEST_SUCCESS);

//     cy.get('[cytest="login_button"]').click();
//   });


//   it('Search Blog On Filter And View', () => {
//     cy.visit("/blogs");

//     cy.get('#q').type('cy8ey080840926v8mn9831zx7s988xa***w55##$');
//     // this term search result in no post
//     cy.get('[cytest="search_blog_btn"]').click();

//     cy.get('[cytest="blog_item"').should('not.exist');

//     cy.get('#q').type('dia diem');
//     // this term search should has some post in fixtures
//     cy.get('[cytest="search_blog_btn"]').click();

//     cy.get('[cytest="blog_item"').first().click()
//   })

// })

// describe('Admin View And Mange Order', () => {

//   it('Search and View Detail, Change Status', () => {
//     cy.visit('/login');

//     cy.get('[cytest="email_input"]').type(credential.ADMIN_EMAIL_USERNAME_TEST_SUCCESS);
//     cy.get('[cytest="password_input"]').type(credential.ADMIN_PASSWORD_TEST_SUCCESS);

//     cy.get('[cytest="login_button"]').click();

//     cy.get('[cytest="personal_icon"]').click();
//     // should be visible login as admin
//     cy.get('[cytest="header_admin_options"]').click();

//     // cy.get('[to="/admin/manage_booking"]').click();
//     cy.visit("/admin/manage_booking");
//     // cy.wait(2000);
//     // cy.get('#q').type('class'); // fixture should has > 1 record with this
//     // // // cy.get('#q').();

//     // cy.get('[cytest="booking_name_click_to_view_detail"]').first();
//     // // fixtures must have more than 1 order

//     // cy.get('[cytest="booking_name_click_to_view_detail"]').first().click();

//     // cy.url().should('contains', 'manage_booking_dt');

//     // cy.get('[cytest="manage_booking_detail_change_status_btn"]').last().contains('Cancelled');
//     // // check contains of last button

//     // cy.get('[cytest="manage_booking_detail_change_status_btn"]').last().click();
//     // // last button mean cancel, and no longer any options to choose

//     // cy.get('[cytest="manage_booking_detail_change_status_btn"]').should('not.exist');
//     // // check for any oher button

//     // cy.get('[cytest="manage_booking_detail_handle_back_manage"]').click(); // back to homepage
//   })
// })


// describe('Service Provider Register Account', () => {
//   it('Search and View Detail, Change Status', () => {
//     cy.visit("/admin/manage_booking");

//     cy.get('#q').type('class'); // fixture should has > 1 record with this

//     cy.get('[cytest="manage_item_order"]').first();
//     // fixtures must have more than 1 order

//     cy.get('[cytest="booking_name_click_to_view_detail"]').first().click();

//     cy.url().should('contains', 'manage_booking_dt');

//     cy.get('[cytest="manage_booking_detail_change_status_btn"]').last().contains('Cancelled');
//     // check contains of last button

//     cy.get('[cytest="manage_booking_detail_change_status_btn"]').last().click();
//     // last button mean cancel, and no longer any options to choose

//     cy.get('[cytest="manage_booking_detail_change_status_btn"]').should('not.exist');
//     // check for any oher button

//     cy.get('[cytest="manage_booking_detail_handle_back_manage"]').click(); // back to homepage
//   })
// })



// describe('Service Provider Register Account', () => {
//   it('Search and View Detail, Change Status', () => {
//     cy.visit("/admin/manage_booking");

//     cy.get('#q').type('class'); // fixture should has > 1 record with this

//     cy.get('[cytest="manage_item_order"]').first();
//     // fixtures must have more than 1 order

//     cy.get('[cytest="booking_name_click_to_view_detail"]').first().click();

//     cy.url().should('contains', 'manage_booking_dt');

//     cy.get('[cytest="manage_booking_detail_change_status_btn"]').last().contains('Cancelled');
//     // check contains of last button

//     cy.get('[cytest="manage_booking_detail_change_status_btn"]').last().click();
//     // last button mean cancel, and no longer any options to choose

//     cy.get('[cytest="manage_booking_detail_change_status_btn"]').should('not.exist');
//     // check for any oher button

//     cy.get('[cytest="manage_booking_detail_handle_back_manage"]').click(); // back to homepage
//   })
// })



describe('Service Provider Register Account', () => {
  it('Normal Flow - Provide Full Information No Images', () => {
    cy.visit("/sp_register");

    cy.get('[name="avatar"]').selectFile(credential.SAMPLE_SP_REGISTER_DATA.avatar);
    cy.get('[name="firstName"]').type(credential.SAMPLE_SP_REGISTER_DATA.firstName);
    cy.get('[name="lastName"]').type(credential.SAMPLE_SP_REGISTER_DATA.lastName);
    cy.get('[name="mobile"]').type(credential.SAMPLE_SP_REGISTER_DATA.mobile);
    cy.get('[name="email"]').type(credential.SAMPLE_SP_REGISTER_DATA.email);
    cy.get('[name="password"]').type(credential.SAMPLE_SP_REGISTER_DATA.password);

    cy.get('[cytest="sp_register_next_btn"]').click();

    cy.get('[name="bussinessName"]').type(credential.SAMPLE_SP_REGISTER_DATA.bussinessName);

    cy.get('[name="address"]').type(credential.SAMPLE_SP_REGISTER_DATA.addressFeed);

    cy.get('[cytest="goong_location_option"]').first().click();
  })
})