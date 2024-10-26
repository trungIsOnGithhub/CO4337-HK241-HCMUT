// const sinon = require('sinon');
const chai = require('chai');
const mocha = require('mocha');
const blogMockUnitTestData = require('./mock.test');
const { TestResponse } = require('../common');

// https://www.youtube.com/watch?v=DvO-YC1wmpg

// API modules
const blogsAPIControllers = require("../../../controllers/blog");

async function genericControllerThrowErrorTest(mock, match, controllerFunc) {
  const resp = new TestResponse();

  let result = null;
  try {
    result = await controllerFunc(mock, resp);
  }
  catch(err) {
    console.log("00000===========000000");
    return {
      ok: true, // Test Performed OK
      msg: "Behavior matched"
    };
  }

  chai.expect(result).to.not.be.null;
  chai.assert.fail("No Error", "Error Thrown", "Expected throw Error but not");
}

async function genericControllerSuccessTest(mock, match, controllerFunc) {
  const resp = new TestResponse();

  let result = null;
  try {
    result = await controllerFunc(mock, resp);
  }
  catch(err) {
    chai.assert.fail("Error Thrown", "No Error", "Throw Error while not Expected");
  }

  chai.expect(result).to.not.be.null;
  chai.expect(result.success).to.be.true;

  const matchKeys = Object.keys(match);
  for (const key of matchKeys) {
      // console.log(key, "======>", match[key] + "---||---" + typeof(match[key]));

      chai.expect(result[key]).to.not.be.null;
      chai.expect(typeof result[key])
          .to.equal(typeof match[key]);

      if (typeof(match[key]) === 'object') {
        const innerResult = result[key];
        const innerMatch = match[key];
        const matchKeys = Object.keys(innerMatch);

        for (const innerKey of matchKeys) {
          // console.log(innerKey, ":::::::>",  innerResult[innerKey] + "+++||+++" + typeof(innerMatch[innerKey]));

          chai.expect(innerResult[innerKey]).to.not.be.null;
          chai.expect(
            typeof innerResult[innerKey]
          ).to.equal(
            typeof innerMatch[innerKey]
          );

          if (innerMatch.length) {
            chai.expect(innerResult.length).to.equal(innerMatch.length);
          }
        }
      }

      if (match.length) {
        chai.expect(result.length).to.equal(match.length);
      }
  }

  return {
    ok: true, // Test Performed OK
    msg: "Behavior matched"
  }; 
}

describe('Test Sample 1 - Blog API', async function() {
    // beforeEach(function() {
    //   const sampleData = require("../tests/mocks/api.blogs.data.test");
    // });
    const currentMockUnitTestData = blogMockUnitTestData[this.title];

    it('BL2-1_POST_/api/blog/_200_CreateSuccess', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];

      await genericControllerSuccessTest(
        mock, match,
        blogsAPIControllers.createNewBlogPost
      );
    });

    it('BL2-2_POST_/api/blog/_400_MissingInput', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];

      await genericControllerThrowErrorTest(
        mock, match,
        blogsAPIControllers.createNewBlogPost
      );
    });
});