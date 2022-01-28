const constants = require("./constants");

jest.mock("@actions/core");
jest.mock("./constants");

const imageNamer = require("./image-namer");

describe("loadFqImageName", () => {
  const imageName = "api";
  const stackName = "example";

  beforeEach(() => {
    jest.resetAllMocks();
    constants.isCI.mockReturnValue(true);
    process.env.STACK_NAME = stackName;
  });

  afterEach(() => {
    process.env.STACK_NAME = "";
  });

  it("throws an error if STACK_NAME is not defined", () => {
    process.env.STACK_NAME = "";

    expect(() =>
      imageNamer.loadFqImageName("ecr.example.org", imageName)
    ).toThrow();
  });

  it("trims and adds a trailing slash to the registry name if required", () => {
    const expected = "ecr.example.org/example/api";

    expect(imageNamer.loadFqImageName("ecr.example.org  ", imageName)).toBe(
      expected
    );
    expect(imageNamer.loadFqImageName("ecr.example.org", imageName)).toBe(
      expected
    );
    expect(imageNamer.loadFqImageName("ecr.example.org/", imageName)).toBe(
      expected
    );
  });

  it("sets the registry component to an empty string for local", () => {
    constants.isCI.mockReturnValue(false);

    expect(imageNamer.loadFqImageName("ecr.example.org", imageName)).toBe(
      "example/api"
    );
  });
});

describe("generateImageTag", () => {
  const gitState = { commitSha: "abcdef123456" };

  beforeEach(() => {
    jest.resetAllMocks();
    constants.isCI.mockReturnValue(true);
  });

  it("returns a short commitSha", () => {
    expect(imageNamer.generateImageTag(gitState)).toBe("abcdef1");
  });

  it("appends the time to the image tag for local", () => {
    constants.isCI.mockReturnValue(false);

    const result = imageNamer.generateImageTag(gitState);

    const nowish = (new Date().getTime() + "").substring(0, 9); // we should have a suffix on the tag close to this
    expect(result).toMatch(`abcdef1-${nowish}`);
  });
});
