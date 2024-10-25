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

module.exports = {
  TestResponse: DummyTestResponseType
}