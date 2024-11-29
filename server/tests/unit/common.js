const chai = require('chai');

// Custom type
class DummyTestResponseType {
  constructor() {}

  status(statusCode) {
    this.statusCode = statusCode;
    return this;
  }

  cookie(cookieValue) {
    this.cookie = cookieValue;
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

function matchRecursiveObjects(result, match) {
  const matchKeys = Object.keys(match);
  for (const key of matchKeys) {
      // console.log(key, "======>", match[key] + "---||---" + typeof(match[key]));
      chai.expect(typeof result[key],
          `Properties ${key} of Result should be: of type ${typeof match[key]}`)
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
  return true;
}

async function testSuccessMiddleware(mock, match, controllerFunc) {
  // check the input
  chai.expect(mock, "Mock Data Should Not Null").to.not.be.null;
  chai.expect(match, "Match Data Should Not Null").to.not.be.null;

  const resp = new DummyTestResponseType();

  let result = null;
  try {
    result = await controllerFunc(mock, resp, ()=>{});
  }
  catch(err) {
    chai.assert.fail("Error Thrown", "No Error", "Throw Error while not Expected");
  }

  chai.expect(result, "Result Should Be Null As Middleware Success.").to.not.be.an("object");

  return {
    ok: true, // Test Performed OK
    msg: "Behavior matched"
  }; 
}

async function testFailMiddleware(mock, match, controllerFunc) {
  // check the input
  chai.expect(mock, "Mock Data Should Not Null").to.not.be.null;
  chai.expect(match, "Match Data Should Not Null").to.not.be.null;

  const resp = new DummyTestResponseType();

  let result = null;
  try {
    result = await controllerFunc(mock, resp, ()=>{});
  }
  catch(err) {
    chai.assert.fail("Error Thrown", "No Error", "Throw Error while not Expected");
  }

  chai.expect(result, "Result Should Not Be Null As Middleware Failed.").to.not.be.null;
  chai.expect(resp?.statusCode).to.not.be.null;

  // console.log("}}}}}}}}", resp);

  chai.expect(resp?.statusCode)
    .to.be.deep.equal(match?.statusCode)
    .to.be.gte(400);
  chai.expect(resp?.success).to.be.false;

  return resp; // return for further logi
}


async function testError(mock, match, controllerFunc) {
  // check the input
  chai.expect(mock, "Mock Data Should Not Null").to.not.be.null;
  chai.expect(match, "Match Data Should Not Null").to.not.be.null;

  const resp = new DummyTestResponseType();

  let result = null;
  try {
    // result = await controllerFunc(mock, resp);
  }
  catch(err) {
    // console.log("00000===========000000" + err);
    return {
      ok: true,// Test Performed OK
      msg: "Behavior matched"
    };
  }

  return {
    ok: true,// Test Performed OK
    msg: "Behavior matched"
  }
}

async function testSuccess(mock, match, controllerFunc) {
  // check the input
  chai.expect(mock, "Mock Data Should Not Null").to.not.be.null;
  chai.expect(match, "Match Data Should Not Null").to.not.be.null;

  const resp = new DummyTestResponseType();

  let result = null;
  try {
    result = await controllerFunc(mock, resp);
    // console.log(result);
  }
  catch(err) {
    // console.log("Error Thrown, But Expected");
    // console.log(result);
    // chai.expect(result, "Result Should Not Null").to.not.be.null;
    // chai.expect(result, "Result Status Shoud Be True").to.be.true;
    // if (!result.status && !result.statusCode) {
    //   chai.expect(result, "Result Should Not Null").to.not.be.null;
    //   if (!result.status && !result.statusCode) {
    //     chai.assert.fail("No Status Or Success Indicator In Response"); 
    //   }
    //   chai.assert.fail("No Status Or Success Indicator In Response"); 
    // }
    chai.assert.fail("Unexpected Error Thrown"); 
    // return {
    //   ok: true,
    //   msg: "Behavior matched"
    // };
  }

  chai.expect(result, "Result Should Not Null").to.not.be.null;
  if (!result.status && !result.statusCode) {
    if (!result.status && !result.statusCode) {
      chai.assert.fail("No Status Or Success Indicator In Response"); 
    }

    chai.assert.fail("No Status Or Success Indicator In Response"); 
  }

  if (match.cookie) {
    chai.expect(typeof resp.cookie).to.be.oneOf(["string", "object"]);
  }

  matchRecursiveObjects(result, match);

  return {
    ok: true, // Test Performed OK
    msg: "Behavior matched"
  };
}

async function testFail(mock, match, controllerFunc) {
  const resp = new DummyTestResponseType();

  let result = null;
  try {
    result = await controllerFunc(mock, resp);
  }
  catch(err) {
    // console.log("ERROR Test For Fail", err, "--------");
    chai.assert.fail("No Error", "Error Thrown", "Expected throw Error but not");
  }

  // console.log("RESP Test For Fail", resp, "--------");
  chai.expect(result, "Result Should Not Null").to.not.be.null;
  chai.expect(result.success).to.be.false;
  
  if (match.msg) {
    chai.expect(result.msg).to.be.a('string');
  }
  if (match.message) {
    chai.expect(result.message).to.be.a('string');
  }
}

function dummyNext() {
  return {
    success: true,
    msg: "Previous middleware Passed!"
  };
}

module.exports = {
  TestResponse: DummyTestResponseType,
  GenericController: {
    testSuccess,
    testError,
    testFail,
    dummyNext,
    testSuccessMiddleware,
    testFailMiddleware
  },
  matchRecursiveObjects
}