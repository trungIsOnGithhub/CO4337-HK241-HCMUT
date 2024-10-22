'use strict';

// const sinon = require('sinon');
const chai = require('chai');
const mocha = require('mocha');

// API modules
const blogsAPIController = require("../../controllers/blog");

// Custom type
class DummyTestResponseType {
  constructor() {
  }

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

mocha.describe('Test Sample 1 - Blog API', function () {
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

      chai.expect(response?.statusCode).to.deep.equal(300);
    }
    else {
      throw new Error("Cannot Prepared Data To Test!");
    }
  });
});

// mocha.run();