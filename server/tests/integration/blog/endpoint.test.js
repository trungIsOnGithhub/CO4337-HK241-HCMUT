const mocha = require('mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
const commons = require('../common');

const blogMockTestData = require('./mock.test');

const chaiWithHttp = chai.use(chaiHttp);

// async function testSuccessPostRequest(done ) {
//     const jsonPostPayload = 
// }

mocha.describe('BLOG GET 1', function () {
    const testSuitMockData = blogMockTestData[this.title];
    // beforeEach(function() {

    // });

    it('_Case: Test Search Blog Successfull', async function () {
        const { mock, match } = testSuitMockData[this.test.title];

        chaiWithHttp.request(commons.TEST_BASE_URL)
            .post('/')
            .send(mock)
            .then(resp => {
                chai.expect(resp).to.have.status(200);
                chai.expect(resp.success).to.not.be.null
                chai.expect(resp?.success).to.be.equal(false);
                chai.expect(resp).to.have.header('content-type', 'application/json');
            })
            .catch(err => {
                throw err;
            });
    });
  
    // it('_should return the response status 200 OK', async function () {
    //   // sinon.stub(swapi, 'films').returns(swapiFilmListMock);
    //   if (pipedTestResponse) {
    //     const response = await blogsAPIController.getAllBlogSampleTest(
    //       { body: { testMode: true } },
    //       pipedTestResponse
    //     );
  
    //     chai.expect(response?.statusCode).to.deep.equal(300);
    //   }
    //   else {
    //     throw new Error("Cannot Prepared Data To Test!");
    //   }
    // });
  });