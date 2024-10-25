// const sinon = require('sinon');
// const chai = require('chai');
// import chai from 'chai';
// import sinon from 'sinon';
// const expect = chai.expect;

// https://www.youtube.com/watch?v=DvO-YC1wmpg

// API modules
const blogsAPIControllers = require("../../../controllers/blog");

// (async function () {
//   const resp = await blogsAPIController.getAllBlogSampleTest({ body: { testMode: true } });

//   console.log("SAMPLE RESPONSE:", resp);
// })();

describe('Test Sample 1 - Blog API', function() {
    beforeEach(function() {
      const sampleData = require("../tests/mocks/api.blogs.data.test");
    });

    it('BL2-1_POST_/api/blog/_200_OK', async function() {
      const response = blogsAPIControllers.createNewBlogPost();
    });

    it('BL2-2_POST_/api/blog/_400_Missing input', async function() {
      const response = blogsAPIControllers.createNewBlogPost();
    });
});