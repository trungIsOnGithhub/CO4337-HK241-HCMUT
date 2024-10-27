const chai = require('chai');
const mocha = require('mocha');
const userMockUnitTestData = require('./mock.test');
const { TestResponse, GenericController } = require('../common');

const serviceAPIControllers = require("../../../controllers/service");

describe('UnitTest SERVICE: Controller', async function() {
    // beforeEach(function() {
    //   const sampleData = require("../tests/mocks/api.blogs.data.test");
    // });
    const currentMockUnitTestData = userMockUnitTestData[this.title];

    console.log("----", currentMockUnitTestData, "-----", this.title);

    it('SVC1-1_POST_/api/service_200_CreateServiceMissingInput', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];

      await GenericController.testError(
        mock, match,
        serviceAPIControllers.createService
      );
    });
    it('SVC1-2_POST_/api/service_400_CreateServiceOK', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];

      console.log("??????", mock);

      await GenericController.testSuccess(
        mock, match,
        serviceAPIControllers.createService
      );
    });


    it('SVC2-1_POST_/api/service_200_AdminUpdateServiceOK', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];

      await GenericController.testSuccess(
        mock, match,
        serviceAPIControllers.updateServiceByAdmin
      );
    });
    it('SVC2-2_POST_/api/service_400_MissingInputError', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];

      await GenericController.testError(
        mock, match,
        serviceAPIControllers.updateServiceByAdmin
      );
    });
    it('SVC2-3_POST_/api/service_400_AdminUpdateNotFoundService', async function() {
        const { mock, match } = currentMockUnitTestData[this.test.title];
  
        await GenericController.testFail(
          mock, match,
          serviceAPIControllers.updateServiceByAdmin
        );
    });


    // it('USR2-3_POST_/api/blog/login_400_AccountBlocked', async function() {
    //     const { mock, match } = currentMockUnitTestData[this.test.title];
  
    //     await GenericController.testError(
    //       mock, match,
    //       serviceAPIControllers.login
    //     );
    // });


    // it('USR3-1_POST_/api/blog/logout_400_LogoutFaikedNoCookie', async function() {
    //   const { mock, match } = currentMockUnitTestData[this.test.title];

    //   await GenericController.testError(
    //     mock, match,
    //     serviceAPIControllers.logout
    //   );
    // });
    // it('USR3-2_POST_/api/blog/logout_200_LogoutOK', async function() {
    //     const { mock, match } = currentMockUnitTestData[this.test.title];

    //     // await GenericController.testSuccess(
    //     //   mock, match,
    //     //   serviceAPIControllers.logout
    //     // );
    // });
    // it('USR3-3_POST_/api/blog/logout_200_LogoutNotFound', async function() {
    //     const { mock, match } = currentMockUnitTestData[this.test.title];

    //     await GenericController.testError(
    //       mock, match,
    //       serviceAPIControllers.logout
    //     );
    // });


    // it('BL4-1_POST_/api/blog/forgotpassword_400_UserNotFound', async function() {
    //   const { mock, match } = currentMockUnitTestData[this.test.title];

    //   await GenericController.testError(
    //     mock, match,
    //     serviceAPIControllers.forgotPassword
    //   );
    // });
    // it('BL4-2_POST_/api/blog/forgotpassword_400_MissingEmail', async function() {
    //   const { mock, match } = currentMockUnitTestData[this.test.title];

    //   await GenericController.testError(
    //     mock, match,
    //     serviceAPIControllers.forgotPassword
    //   );
    // });
    // it('BL4-3_POST_/api/blog/forgotpassword_400_ForgotPasswordOK', async function() {
    //   const { mock, match } = currentMockUnitTestData[this.test.title];

    //   await GenericController.testSuccess(
    //     mock, match,
    //     serviceAPIControllers.forgotPassword
    //   );
    // });

});