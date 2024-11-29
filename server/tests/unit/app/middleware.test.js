// const sinon = require('sinon');
require('dotenv').config();
const chai = require('chai');
const mocha = require('mocha');
const jwt = require('jsonwebtoken');
const middlewareMockUnitTestData = require('./mock.test');
const {
    GenericController,
    matchRecursiveObjects } = require('../common');

// https://www.youtube.com/watch?v=DvO-YC1wmpg
// Middleware modules
const appAuthMilddewares = require("../../../middlewares/verify_token");

describe('UnitTest APP: Middlewares', async function() {
    // beforeEach(function() {
    //   const sampleData = require("../tests/mocks/api.blogs.data.test");
    // });
    const currentMockUnitTestData = middlewareMockUnitTestData[this.title];

    it('MDW1-1_IsAdmin_401_RequireAdminRole', async function() {
        const { mock, match } = currentMockUnitTestData[this.test.title];
        // Data prep
        chai.expect(mock?.user?.role, "Role Should Not Be Null").to.be.a("string");

        await GenericController.testFailMiddleware(
            mock, match,
            appAuthMilddewares.isAdmin
        );
    });

    it('MDW1-2_IsAdmin_200_AdminSuccess', async function() {
        const { mock, match } = currentMockUnitTestData[this.test.title];
        // Data prep
        chai.expect(mock?.user?.role, "Role Should Not Be Null").to.be.a("string");

        await GenericController.testSuccessMiddleware(
            mock, match,
            appAuthMilddewares.isAdmin
        );
    });


    it('MDW2-1_VerifyAccessToken_401_RequireAuthentication', async function() {
      const { mock, match } = currentMockUnitTestData[this.test.title];
        // Data prep
        chai.expect(match.jwtData, "JWT Data must be available to encode.").to.be.an("object");
        chai.expect(mock?.headers?.authorization).to.be.a("string");

        const accessToken = jwt.sign(match.jwtData, "jsdi910u92w8209iw2u1932183902091is92010", {expiresIn: match.jwtData.expiresIn});
        chai.expect(accessToken).to.be.a("string");

        mock.headers.authorization += accessToken;

        console.log("11111", mock, "1111");
        console.log("22222", match, "2222");

        await GenericController.testFailMiddleware(
            mock, match,
            appAuthMilddewares.verifyAccessToken
        );

        // chai.expect(mock.user,
        //     "After Middleware User Data Should Present")
        //     .to.be.an("object");

        // matchRecursiveObjects(mock.user, match.jwtData);
    });
    it('MDW2-2_VerifyAccessToken_400_InvalidToken', async function() {
        const { mock, match } = currentMockUnitTestData[this.test.title];
          // Data prep
          chai.expect(match.jwtData, "JWT Data must be available to encode.").to.be.an("object");
          chai.expect(mock?.headers?.authorization).to.be.a("string");
  
          const accessToken = jwt.sign(match.jwtData, "jsdi910u92w8209iw2u1932183902091is92010", {expiresIn: match.jwtData.expiresIn});
          chai.expect(accessToken).to.be.a("string");
  
          mock.headers.authorization += accessToken;
  
          // console.log("11111", mock, "1111");
          // console.log("22222", match, "2222");
  
          await GenericController.testFailMiddleware(
              mock, match,
              appAuthMilddewares.verifyAccessToken
          );
    });
    it('MDW2-3_VerifyAccessToken_200_Success', async function() {
        const { mock, match } = currentMockUnitTestData[this.test.title];
          // Data prep
          chai.expect(match.jwtData, "JWT Data must be available to encode.").to.be.an("object");
          chai.expect(mock?.headers?.authorization).to.be.a("string");
  
          const accessToken = jwt.sign(match.jwtData, "jsdi910u92w8209iw2u1932183902091is92010", {expiresIn: match.jwtData.expiresIn});
          chai.expect(accessToken).to.be.a("string");
  
          mock.headers.authorization += accessToken;
  
          // console.log("11111", mock, "1111");
          // console.log("22222", match, "2222");
  
          const resp = await GenericController.testFailMiddleware(
              mock, match,
              appAuthMilddewares.verifyAccessToken
          );
  
          chai.expect(resp.user,
              "After Middleware User Data Should Not Present")
              .to.be.undefined;
  
          // matchRecursiveObjects(resp.user, match.jwtData);
    });

});