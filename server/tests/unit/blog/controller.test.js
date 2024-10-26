// const sinon = require('sinon');
const chai = require('chai');
const mocha = require('mocha');
const blogMockUnitTestData = require('./mock.test');
const { TestResponse, GenericController } = require('../common');

// https://www.youtube.com/watch?v=DvO-YC1wmpg

// API modules
const blogsAPIControllers = require("../../../controllers/blog");

describe('UnitTest BLOG: Controller', async function() {
    // beforeEach(function() {
    //   const sampleData = require("../tests/mocks/api.blogs.data.test");
    // });
    const currentMockUnitTestData = blogMockUnitTestData[this.title];

    it('BL2-1_POST_/api/blog/_200_CreateSuccess', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];

      await GenericController.testSuccess(
        mock, match,
        blogsAPIControllers.createNewBlogPost
      );
    });


    it('BL2-2_POST_/api/blog/_400_MissingInput', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];

      await GenericController.testError(
        mock, match,
        blogsAPIControllers.createNewBlogPost
      );
    });


    it('BL2-3_PUT_/upload_image/:bid_200_UploadImageSuccess', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];

      await GenericController.testSuccess(
        mock, match,
        blogsAPIControllers.uploadImage
      );
    });


    it('BL2-4_PUT_/api/blog/:bid_200_UpdateSuccess', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];

      await GenericController.testSuccess(
        mock, match,
        blogsAPIControllers.updateBlog
      );
    });


    it('BL2-5_POST_/api/blog/like_200_LikeSuccess', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];

      await GenericController.testSuccess(
        mock, match,
        blogsAPIControllers.likeBlog
      );
    });
    it('BL2-6_POST_/api/blog/like_400_LikeThrowError', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];

      await GenericController.testError(
        mock, match,
        blogsAPIControllers.likeBlog
      );
    });


    it('BL2-7_POST_/api/blog/dislike_200_DislikeSuccess', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];

      await GenericController.testSuccess(
        mock, match,
        blogsAPIControllers.dislikeBlog
      );
    });
    it('BL2-8_POST_/api/blog/dislike_400_DislikeThrowError', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];

      await GenericController.testError(
        mock, match,
        blogsAPIControllers.likeBlog
      );
    });
});