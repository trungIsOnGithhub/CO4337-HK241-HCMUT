const chai = require('chai');
const mocha = require('mocha');
const providerMockUnitTestData = require('./mock.test');
const { TestResponse, GenericController } = require('../common');

const staffAPIControllers = require("../../../controllers/staff");

describe('UnitTest STAFF: Controller', async function() {
    const currentMockUnitTestData = providerMockUnitTestData[this.title];
    // console.log("----", currentMockUnitTestData, "-----", this.title);

    it('STFF1-1_POST_/api/staff_200_AddStaffMissingInput', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];

      await GenericController.testError(
        mock, match,
        staffAPIControllers.addStaff
      );
    });
    it('STFF1-2_POST_/api/staff_200_AddStaffTimeout', async function() {
        const { mock, match } = currentMockUnitTestData[this.test.title];

        await GenericController.testError(
            mock, match,
            staffAPIControllers.addStaff
        );
    });
    it('STFF1-3_POST_/api/staff_400_AddStaffAlreadyExist', async function() {
        const { mock, match } = currentMockUnitTestData[this.test.title];

        await GenericController.testError(
            mock, match,
            staffAPIControllers.addStaff
        );
    });


    it('STFF2-1_GET_/api/staff_200_GetAllStaffsByProviderOK', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];
// console.log(mock, match);
      let resp = await GenericController.testError(
        mock, match,
        staffAPIControllers.getAllStaffsByAdmin
      );

      // console.log('============>' + JSON.stringify(resp));\
      chai.expect(resp.ok).to.be.true;
      chai.expect(resp.msg).to.be.equal('Behavior matched');
    });

    it('STFF2-2_GET_/api/staff_400_MissingProviderInput', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];

      await GenericController.testError(
        mock, match,
        staffAPIControllers.getAllStaffsByAdmin
      );
    });


    // it('STFF3-1_DELETE_/api/staff_400_DeleteNonExistProvider', async function() {
    //     const { mock, match } = currentMockUnitTestData[this.test.title];
  
    //     await GenericController.testError(
    //       mock, match,
    //       staffAPIControllers.deleteServiceProvider
    //     );
    // });
    // it('STFF3-2_DELETE_/api/staff_400_MissingInput', async function() {
    //     const { mock, match } = currentMockUnitTestData[this.test.title];
  
    //     await GenericController.testError(
    //       mock, match,
    //       staffAPIControllers.deleteServiceProvider
    //     );
    // });


    // it('STFF4-1_GET_/api/staff/owner_400_MissingInput', async function() {
    //     const { mock, match } = currentMockUnitTestData[this.test.title];
  
    //     await GenericController.testError(
    //       mock, match,
    //       staffAPIControllers.getServiceProviderByOwnerId
    //     );
    // });
    // it('STFF4-2_GET_/api/staff/owner_400_GetProviderByNonExistOwner', async function() {
    //   const { mock, match } = currentMockUnitTestData[this.test.title];

    //   await GenericController.testSuccess(
    //     mock, match,
    //     staffAPIControllers.getServiceProviderByOwnerId
    //   );
    // });
});