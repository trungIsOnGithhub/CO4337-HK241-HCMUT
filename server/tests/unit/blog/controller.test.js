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

  return {
    ok: true, // Test Performed OK
    msg: "Behavior NOT matched"
  }; 
}

async function genericControllerPostSuccessTest(mock, match, controllerFunc) {
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

  return {
    ok: true, // Test Performed OK
    msg: "Behavior NOT matched"
  }; 
}

describe('Test Sample 1 - Blog API', async function() {
    // beforeEach(function() {
    //   const sampleData = require("../tests/mocks/api.blogs.data.test");
    // });
    const currentMockUnitTestData = blogMockUnitTestData[this.title];

    it('BL2-1_POST_/api/blog/_200_CreateSuccess', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];

      await genericControllerThrowErrorTest(
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