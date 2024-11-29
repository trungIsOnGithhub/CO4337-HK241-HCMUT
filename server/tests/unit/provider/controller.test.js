const chai = require('chai');
const mocha = require('mocha');
const providerMockUnitTestData = require('./mock.test');
const { TestResponse, GenericController } = require('../common');

const providerAPIControllers = require("../../../controllers/ServiceProvider");

describe('UnitTest PROVIDER: Controller', async function() {
    // beforeEach(function() {
    //   const sampleData = require("../tests/mocks/api.blogs.data.test");
    // });
    const currentMockUnitTestData = providerMockUnitTestData[this.title];

    // console.log("----", currentMockUnitTestData, "-----", this.title);

    it('PRVD1-1_POST_/api/service_provider_200_CreateProviderMissingInput', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];

      await GenericController.testFail(
        mock, match,
        providerAPIControllers.createServiceProvider
      );
    });
    it('PRVD1-2_POST_/api/service_provider_200_CreateProviderSuccess', async function() {
        const { mock, match } = currentMockUnitTestData[this.test.title];

        await GenericController.testFail(
            mock, match,
            providerAPIControllers.createServiceProvider
        );
    });
    it('PRVD1-3_POST_/api/service_provider_400_CreateProviderAlreadyExist', async function() {
        const { mock, match } = currentMockUnitTestData[this.test.title];

        await GenericController.testFail(
            mock, match,
            providerAPIControllers.createServiceProvider
        );
    });

    it('PRVD2-1_GET_/api/service_provider_200_GetAllProviderTimeout', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];

      await GenericController.testError(
        mock, match,
        providerAPIControllers.getAllServiceProvider
      );
    });
    it('PRVD2-2_GET_/api/service_provider_400_GetNoProvider', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];

      await GenericController.testError(
        mock, match,
        providerAPIControllers.getAllServiceProvider
      );
    });


    it('PRVD3-1_DELETE_/api/service_provider_400_DeleteNonExistProvider', async function() {
        const { mock, match } = currentMockUnitTestData[this.test.title];
  
        await GenericController.testError(
          mock, match,
          providerAPIControllers.deleteServiceProvider
        );
    });
    it('PRVD3-2_DELETE_/api/service_provider_400_MissingInput', async function() {
        const { mock, match } = currentMockUnitTestData[this.test.title];
  
        await GenericController.testError(
          mock, match,
          providerAPIControllers.deleteServiceProvider
        );
    });


    it('PRVD4-1_GET_/api/service_provider/owner_400_MissingInput', async function() {
        const { mock, match } = currentMockUnitTestData[this.test.title];
  
        await GenericController.testError(
          mock, match,
          providerAPIControllers.getServiceProviderByOwnerId
        );
    });
    it('PRVD4-2_GET_/api/service_provider/owner_400_GetProviderByNonExistOwner', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];

      await GenericController.testError(
        mock, match,
        providerAPIControllers.getServiceProviderByOwnerId
      );
    });

    // it('USR3-2_POST_/api/blog/logout_200_LogoutOK', async function() {
    //     const { mock, match } = currentMockUnitTestData[this.test.title];

    //     // await GenericController.testSuccess(
    //     //   mock, match,
    //     //   providerAPIControllers.logout
    //     // );
    // });
    // it('USR3-3_POST_/api/blog/logout_200_LogoutNotFound', async function() {
    //     const { mock, match } = currentMockUnitTestData[this.test.title];

    //     await GenericController.testError(
    //       mock, match,
    //       providerAPIControllers.logout
    //     );
    // });


    // it('BL4-1_POST_/api/blog/forgotpassword_400_UserNotFound', async function() {
    //   const { mock, match } = currentMockUnitTestData[this.test.title];

    //   await GenericController.testError(
    //     mock, match,
    //     providerAPIControllers.forgotPassword
    //   );
    // });
    // it('BL4-2_POST_/api/blog/forgotpassword_400_MissingEmail', async function() {
    //   const { mock, match } = currentMockUnitTestData[this.test.title];

    //   await GenericController.testError(
    //     mock, match,
    //     providerAPIControllers.forgotPassword
    //   );
    // });
    // it('BL4-3_POST_/api/blog/forgotpassword_400_ForgotPasswordOK', async function() {
    //   const { mock, match } = currentMockUnitTestData[this.test.title];

    //   await GenericController.testSuccess(
    //     mock, match,
    //     providerAPIControllers.forgotPassword
    //   );
    // });

});