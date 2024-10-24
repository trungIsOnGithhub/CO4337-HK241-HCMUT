'use strict';

// const sinon = require('sinon');
const chai = require('chai');
const promisePlugin = require('chai-as-promised');

const chaiWithPromise = require('chai').use(promisePlugin);
const mocha = require('mocha');

// API modules
const blogsAPIController = require("../../../controllers/blog");

// Custom type
class DummyTestResponseType {
  constructor() {}

  status(statusCode) {
    this.statusCode = statusCode;
    return this;
  }

  json(object) {
    for (const key of Object.keys(object)) {
      this[key] = object[key];
    }
    return this;
  }

  stringify() {
    return JSON.stringify(this);
  }
}
// console.log((new DummyTestResponseType()).status(200).json({number:68,string:"vui"}).stringify());

// (async function () {
//   const result = await blogsAPIController.getAllBlogSampleTest({ body: { testMode: true } }, testResponse);

//   console.log("SAMPLE RESPONSE:", result);
// })();

const chaiExpectBadRequestBodyData = function(resp) {
  chai.expect(resp).to.not.be.null;
  chai.expect(resp?.success).to.not.be.null;
  chai.expect(resp.success).to.be.false;
}

mocha.describe('Should Test Wrong Response Scenarios', function (done) {
  // beforeEach(function () {
  // });
  it('_Test Request Missing Data Field: { title }', async function() {
    const req = {
      body: {
        content: "string",
        title: null
      }
    };
    const resp = new DummyTestResponseType();

    await chaiWithPromise.expect(
      blogsAPIController.createNewBlogPost(req, resp)
    ).to.be.rejectedWith("Missing input");

  });

  // it('_Test Request Missing Data Field: { content }', async function() {
  //   const req = {
  //     body: {
  //       content: null,
  //       title: "string"
  //     }
  //   };
  //   const resp = new DummyTestResponseType();

  //   let result = null;
  //   try {
  //   result = await blogsAPIController.createNewBlogPost(
  //     req, resp
  //   );
  //   } catch(err) { console.log(err); }

  //   chaiExpectBadRequestBodyData(result);
  // });
});

mocha.describe('Should Test Success Get Request Scenarios', function () {
  let pipedTestResponse = null;
  beforeEach(function () {
    pipedTestResponse = new DummyTestResponseType();
  });

  it('_should return the response status 400 with data loss', async function () {
    // sinon.stub(swapi, 'films').returns(swapiFilmListMock);
    if (pipedTestResponse) {
      const response = await blogsAPIController.getAllBlogSampleTest(
        { body: { testMode: false } },
        pipedTestResponse
      );

      chai.expect(response?.statusCode).to.deep.equal(400);
    }
    else {
      throw new Error("Cannot Prepared Data To Test!");
    }
  });

  it('_should return the response status 200 OK', async function () {
    // sinon.stub(swapi, 'films').returns(swapiFilmListMock);
    if (pipedTestResponse) {
      const response = await blogsAPIController.getAllBlogSampleTest(
        { body: { testMode: true } },
        pipedTestResponse
      );

      chai.expect(response?.statusCode).to.deep.equal(200);
    }
    else {
      throw new Error("Cannot Prepared Data To Test!");
    }
  });
});

// mocha.run();