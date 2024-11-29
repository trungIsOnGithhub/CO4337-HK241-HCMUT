// const sinon = require('sinon');
const chai = require('chai');
const mocha = require('mocha');
const orderMockUnitTestData = require('./mock.test');
const { TestResponse, GenericController } = require('../common');

// https://www.youtube.com/watch?v=DvO-YC1wmpg

// API modules
const orderAPIControllers = require("../../../controllers/order");

  describe('UnitTest ORDER: Controller', async function() {
    // beforeEach(function() {
    //   const sampleData = require("../tests/mocks/api.blogs.data.test");
    // });
    const currentMockUnitTestData = orderMockUnitTestData[this.title];

    it('ORD-1_POST_/api/order/_400_CreateOrderMissingInput', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];

      await GenericController.testError(
        mock, match,
        orderAPIControllers.createNewOrder
      );
    });


    it('ORD-2_POST_/api/order/_400_MissingInput2', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];

      await GenericController.testError(
        mock, match,
        orderAPIControllers.createNewOrder
      );
    });


    it('ORD-3_PUT_/order/update_status/:bid_404_UpdateStatusNoExist', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];

      await GenericController.testError(
        mock, match,
        orderAPIControllers.createNewOrder
      );
    });


    it('ORD-4_PUT_/api/order/_GetUserOrderNotExist', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];

      await GenericController.testError(
        mock, match,
        orderAPIControllers.getUserOrder
      );
    });


    it('ORD-5_POST_/api/order/_200_GetOrdersByAdminFail', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];

      await GenericController.testError(
        mock, match,
        orderAPIControllers.getOrdersByAdmin
      );
    });
  
    it('ORD-6_POST_/api/order/staff_calendar_400_getOrdersForStaffCalendarError', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];

      await GenericController.testError(
        mock, match,
        orderAPIControllers.likeBlog
      );
    });


    // it('ORD-7_POST_/api/blog/dislike_200_DislikeSuccess', async function() {
    //   const { mock, match } = currentMockUnitTestData[this.test.title];

    //   await GenericController.testSuccess(
    //     mock, match,
    //     blogsAPIControllers.dislikeBlog
    //   );
    // });
    // it('ORD-8_POST_/api/blog/dislike_400_DislikeThrowError', async function() {
    //   const { mock, match } = currentMockUnitTestData[this.test.title];

    //   await GenericController.testError(
    //     mock, match,
    //     blogsAPIControllers.likeBlog
    //   );
    // });

    // it('ORD-9_POST_/api/blog/top_tags_200_GetTopTagsSuccess', async function() {
    //   const { mock, match } = currentMockUnitTestData[this.test.title];

    //   await GenericController.testError(
    //     mock, match,
    //     blogsAPIControllers.getTopTags
    //   );
    // });

});