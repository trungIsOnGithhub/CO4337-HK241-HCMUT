const mocha = require('mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
const commons = require('../common');

const blogMockTestData = require('./mock.test');

const chaiWithHttp = require('chai').use(chaiHttp);

// async function testSuccessPostRequest(done ) {
//     const jsonPostPayload = 
// }

mocha.describe('BLOG GET 1', function () {
    const testSuitMockData = blogMockTestData[this.title];
    // beforeEach(function() {
    //     commons.expressApp.listen(commons.TEST_PORT, () =>)
    // });

    it('BL1_/api/blog/_400_Missing input', async function () {
        const titleSplitted = this.test.title.split('_');

        const endpoint = titleSplitted[1];
        const { mock, match, httpStatusCode } = testSuitMockData[this.test.title];

        console.log("EP", endpoint, "--------");
        console.log("MOCK:", mock, "-------");
        console.log("MATCH:", match, "--------");

        const resp = await chaiWithHttp.request(commons.expressApp)
            // .Request(commons.expressApp)
            // .execute(commons.expressApp)
            .post(endpoint)
            .send(mock);
        
            // .then(resp => {
                chai.expect(resp.success).to.not.be.null;
                chai.expect(resp).to.have.status(httpStatusCode);
                chai.expect(resp).to.have.header('content-type', 'application/json; charset=utf-8');
                chai.expect(resp.text).to.not.be.null;

                console.log(JSON.stringify(resp), "=======================");

                const matchKeys = Object.keys(match);
                for (const key of matchKeys) {
                    console.log(key, "======>", match[key] + "---||---" + typeof(match[key]));

                    chai.expect(resp.text[key]).to.be.equal(match[key]);
                    chai.expect(resp.text[key]).to.be.an( typeof(match[key]) );
                }
            // })
            // .catch(err => {
            //     throw err;
            // });
        
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