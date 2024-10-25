// const sinon = require('sinon');
const chai = require('chai');
const mocha = require('mocha');
const blogMockUnitTestData = require('./mock.test');

// https://www.youtube.com/watch?v=DvO-YC1wmpg

// API modules
const blogsAPIControllers = require("../../../controllers/blog");

// (async function () {
//   const resp = await blogsAPIController.getAllBlogSampleTest({ body: { testMode: true } });

//   console.log("SAMPLE RESPONSE:", resp);
// })();

describe('Test Sample 1 - Blog API', async function(done) {
    // beforeEach(function() {
    //   const sampleData = require("../tests/mocks/api.blogs.data.test");
    // });
    const currentMockUnitTestData = blogMockUnitTestData[this.title];

    it('BL2-1_POST_/api/blog/_200_OK', async function() {
      const { mock, match } = blogMockUnitTestData[this.test.title];
      const resp = new DummyTestResponseType();

      let result = null;
      try {
        result = await blogsAPIControllers.createNewBlogPost(mock, resp);
      }
      catch(err) {
        done(err); // Failed Right After Throw Error
      }

      chai.expect(result).to.not.be.null;
      // chai.expect(resp).to.have.status(httpStatusCode);
      // chai.expect(resp).to.have.header('content-type', 'application/json; charset=utf-8');
      // chai.expect(resp.text).to.not.be.null;

      console.log(JSON.stringify(resp), "=======================");

      const matchKeys = Object.keys(match);
      for (const key of matchKeys) {
          console.log(key, "======>", match[key] + "---||---" + typeof(match[key]));

          chai.expect(result[key]).to.be.equal(match[key]);
          chai.expect(result[key]).to.be.an( typeof(match[key]) );
      }
    });

    // it('BL2-2_POST_/api/blog/_400_Missing input', async function() {
    //   const response = await blogsAPIControllers.createNewBlogPost();
    // });
});