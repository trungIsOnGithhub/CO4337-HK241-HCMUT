// const sinon = require('sinon');
// const chai = require('chai');
// import chai from 'chai';
// import sinon from 'sinon';
// const expect = chai.expect;

// https://www.youtube.com/watch?v=DvO-YC1wmpg

// API modules
const blogsAPIController = require("../../controllers/blog");

(async function () {
  const resp = await blogsAPIController.getAllBlogSampleTest({ body: { testMode: true } });

  console.log("SAMPLE RESPONSE:", resp);
})();

// describe('Test Sample 1 - Blog API', function() {
//     beforeEach(function() {
//       const sampleData = require("../tests/mocks/api.blogs.data.test");
//     });

//     it('_should return the response status 400 with data loss', async function() {
//       // sinon.stub(swapi, 'films').returns(swapiFilmListMock);

//       const response = await starwars.filmList();
//       expect(response).to.deep.equal(starwarsFilmListMock);
//     });

//     it('_should return the response status 200 OL', async function() {
//       // sinon.stub(swapi, 'films').returns(swapiFilmListMock);

//       const response = await starwars.filmList();
//       expect(response).to.deep.equal(starwarsFilmListMock);
//     });
// });