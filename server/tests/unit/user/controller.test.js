const chai = require('chai');
const mocha = require('mocha');
const userMockUnitTestData = require('./mock.test');
const { TestResponse, GenericController } = require('../common');

const servicesAPIControllers = require("../../../controllers/user");

describe('UnitTest USER: Controller', async function() {
    // beforeEach(function() {
    //   const sampleData = require("../tests/mocks/api.blogs.data.test");
    // });
    const currentMockUnitTestData = userMockUnitTestData[this.title];

    it('USR1-1_POST_/api/user/register_200_RegisterAdminSuccess', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];

      await GenericController.testSuccess(
        mock, match,
        servicesAPIControllers.register
      );
    });
    it('USR1-2_POST_/api/user/register_400_UserAlreadyExist', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];

      await GenericController.testError(
        mock, match,
        servicesAPIControllers.createService
      );
    });
    it('USR1-3_POST_/api/user/register_400_MissingInputError', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];

      await GenericController.testFail(
        mock, match,
        servicesAPIControllers.register
      );
    });


    it('USR2-1_POST_/api/blog/login_400_LoginFailed', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];

      await GenericController.testError(
        mock, match,
        servicesAPIControllers.login
      );
    });
    it('USR2-2_POST_/api/blog/login_400_LoginSuccess', async function() {
        const { mock, match } = currentMockUnitTestData[this.test.title];
  
        await GenericController.testError(
          mock, match,
          servicesAPIControllers.login
        );
    });
    it('USR2-3_POST_/api/blog/login_400_AccountBlocked', async function() {
        const { mock, match } = currentMockUnitTestData[this.test.title];
  
        await GenericController.testError(
          mock, match,
          servicesAPIControllers.login
        );
    });


    it('USR3-1_POST_/api/blog/logout_400_LogoutFaikedNoCookie', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];

      await GenericController.testError(
        mock, match,
        servicesAPIControllers.logout
      );
    });
    it('USR3-2_POST_/api/blog/logout_200_LogoutOK', async function() {
        const { mock, match } = currentMockUnitTestData[this.test.title];

        // await GenericController.testSuccess(
        //   mock, match,
        //   servicesAPIControllers.logout
        // );
    });
    it('USR3-3_POST_/api/blog/logout_200_LogoutNotFound', async function() {
        const { mock, match } = currentMockUnitTestData[this.test.title];

        await GenericController.testError(
          mock, match,
          servicesAPIControllers.logout
        );
    });


    // it('BL4-1_POST_/api/blog/forgotpassword_400_UserNotFound', async function() {
    //   const { mock, match } = currentMockUnitTestData[this.test.title];

    //   await GenericController.testError(
    //     mock, match,
    //     servicesAPIControllers.forgotPassword
    //   );
    // });
    // it('BL4-2_POST_/api/blog/forgotpassword_400_MissingEmail', async function() {
    //   const { mock, match } = currentMockUnitTestData[this.test.title];

    //   await GenericController.testError(
    //     mock, match,
    //     servicesAPIControllers.forgotPassword
    //   );
    // });
    // it('BL4-3_POST_/api/blog/forgotpassword_400_ForgotPasswordOK', async function() {
    //   const { mock, match } = currentMockUnitTestData[this.test.title];

    //   await GenericController.testSuccess(
    //     mock, match,
    //     servicesAPIControllers.forgotPassword
    //   );
    // });

});