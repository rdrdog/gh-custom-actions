const constants = require("./constants");

describe("isCI", () => {

  afterEach(() => {
    process.env.ACT = '';
  });

  it("returns true if env.ACT is not true", async () => {
    process.env.ACT = null;
    expect(constants.isCI()).toBeTruthy();

    process.env.ACT = '';
    expect(constants.isCI()).toBeTruthy();

    process.env.ACT = 'nope';
    expect(constants.isCI()).toBeTruthy();
  });

  it("returns false if env.ACT is set to true", async () => {
    process.env.ACT = 'true';
    expect(constants.isCI()).toBeFalsy();
  });

});
