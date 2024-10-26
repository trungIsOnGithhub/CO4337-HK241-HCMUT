const chai = require('chai');
const mocha = require('mocha');
const userMockUnitTestData = require('./mock.test');
const { TestResponse, GenericController } = require('../common');

const usersAPIControllers = require("../../../controllers/user");

describe('UnitTest USER: Controller', async function() {
    // beforeEach(function() {
    //   const sampleData = require("../tests/mocks/api.blogs.data.test");
    // });
    const currentMockUnitTestData = userMockUnitTestData[this.title];

    it('USR1-1_POST_/api/user/register_200_RegisterAdminSuccess', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];

      await GenericController.testSuccess(
        mock, match,
        usersAPIControllers.register
      );
    });

    it('USR1-2_POST_/api/user/register_400_UserAlreadyExist', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];

      await GenericController.testError(
        mock, match,
        usersAPIControllers.register
      );
    });


    it('USR1-3_POST_/api/user/register_400_MissingInputError', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];

      await GenericController.testFail(
        mock, match,
        usersAPIControllers.register
      );
    });


    it('BL2-1_POST_/api/blog/:bid_400_LoginFailed', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];

      await GenericController.testError(
        mock, match,
        usersAPIControllers.login
      );
    });


    it('BL2-5_POST_/api/blog/like_200_LikeSuccess', async function() {
    //   const { mock, match } = currentMockUnitTestData[this.test.title];

    //   await GenericController.testSuccess(
    //     mock, match,
    //     usersAPIControllers.likeBlog
    //   );
    });
    it('BL2-6_POST_/api/blog/like_400_LikeThrowError', async function() {
    //   const { mock, match } = currentMockUnitTestData[this.test.title];

    //   await GenericController.testError(
    //     mock, match,
    //     usersAPIControllers.likeBlog
    //   );
    });


    it('BL2-7_POST_/api/blog/dislike_200_DislikeSuccess', async function() {
    //   const { mock, match } = currentMockUnitTestData[this.test.title];

    //   await GenericController.testSuccess(
    //     mock, match,
    //     usersAPIControllers.dislikeBlog
    //   );
    });
    it('BL2-8_POST_/api/blog/dislike_400_DislikeThrowError', async function() {
    //   const { mock, match } = currentMockUnitTestData[this.test.title];

    //   await GenericController.testError(
    //     mock, match,
    //     usersAPIControllers.likeBlog
    //   );
    });

    it('BL2-9_POST_/api/blog/top_tags_200_GetTopTagsSuccess', async function() {
    //   const { mock, match } = currentMockUnitTestData[this.test.title];

    //   await GenericController.testSuccess(
    //     mock, match,
    //     usersAPIControllers.getTopTags
    //   );
    });

});