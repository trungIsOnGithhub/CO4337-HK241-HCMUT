const mocha = require('mocha');
const chaiModule = require('chai');
const chaiHttp = require('chai-http');
const commons = require('../common');

const chai = chaiModule.use(chaiHttp);

async function testSuccessPostRequest() {
    const jsonPostPayload = 
}

mocha.describe('Integration Endpoint Test - Get All Blog - Page 1 - Limit 10 No Filter', function () {
    const { mock, match } = require();

    beforeEach(function() {

    });

    it('_Test Search Blog Successfully', async function () {
        const allBlogQueryObject = {
            searchTerm: "",
            selectedTags: [],
            limit: 5,
            page: 1
        };

        chai.request(commons.TEST_BASE_URL)
            .post('/')
            .send(allBlogQueryObject)
            .then(resp => {
                expect(resp).to.have.status(200);
                expect(resp?.success).to.be.equal(false);
                expect(resp).to.have.header('content-type', 'application/json');
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