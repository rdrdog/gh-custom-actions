const core = require("@actions/core");
const constants = require("@eroad/gh-common/constants");
const docker = require("@eroad/gh-common/docker");
const git = require("@eroad/gh-common/git");
const imageNamer = require("@eroad/gh-common/image-namer");
const manifest = require("@eroad/gh-common/manifest");

jest.mock("@actions/core");
jest.mock("@eroad/gh-common/constants");
jest.mock("@eroad/gh-common/docker");
jest.mock("@eroad/gh-common/git");
jest.mock("@eroad/gh-common/image-namer");
jest.mock("@eroad/gh-common/manifest");

const { build } = require("./build");

describe("build", () => {
  const gitState = {
    branchName: "main",
    buildNumber: "123",
    commitSha: "defabc123",
  };
  const fqImageName = "ecr.example.org/example/api";
  const imageTag = "abcdef12";
  const inputs = {
    registry: "ecr.example.org",
    image_name: "api",
    dockerfile: "./src/api/Dockerfile",
    context: "./src/",
  };

  beforeEach(() => {
    jest.resetAllMocks();
    core.getInput.mockImplementation((inputName) => {
      return inputs[inputName];
    });

    git.loadGitStateAsync.mockResolvedValue(gitState);
    imageNamer.loadFqImageName.mockReturnValue(fqImageName);
    imageNamer.generateImageTag.mockReturnValue(imageTag);
    constants.isCI.mockReturnValue(false);
  });

  it("pulls the latest image when running in CI", async () => {
    constants.isCI.mockReturnValue(false);
    await build();
    expect(docker.pullAsync).toHaveBeenCalledTimes(0);

    constants.isCI.mockReturnValue(true);
    await build();
    expect(docker.pullAsync).toHaveBeenCalledTimes(1);
    expect(docker.pullAsync).toHaveBeenCalledWith(`${fqImageName}:latest`);
  });

  describe("docker build", () => {
    const expectedBuildArgs = [
      `BUILD_NUMBER="${gitState.buildNumber}"`,
      `COMMIT_SHA="${gitState.commitSha}"`,
    ];

    it("runs docker build with expected parameters", async () => {
      await build();

      expect(docker.buildAsync).toHaveBeenCalledTimes(1);
      expect(docker.buildAsync).toHaveBeenCalledWith(
        inputs.dockerfile,
        inputs.context,
        fqImageName,
        imageTag,
        expectedBuildArgs
      );
    });

    it("defaults the context path to the folder of the dockerfile", async () => {
      inputs.context = "";

      await build();

      expect(docker.buildAsync).toHaveBeenCalledTimes(1);
      expect(docker.buildAsync).toHaveBeenCalledWith(
        inputs.dockerfile,
        "./src/api",
        fqImageName,
        imageTag,
        expectedBuildArgs
      );
    });
  });

  it("pushes the images when running in CI", async () => {
    constants.isCI.mockReturnValue(false);
    await build();
    expect(docker.pushAsync).toHaveBeenCalledTimes(0);

    constants.isCI.mockReturnValue(true);
    await build();
    expect(docker.pushAsync).toHaveBeenCalledTimes(2);
    expect(docker.pushAsync).toHaveBeenCalledWith(`${fqImageName}:${imageTag}`);
    expect(docker.pushAsync).toHaveBeenCalledWith(`${fqImageName}:latest`);
  });

  it("stores the image name and tag in the manifest", async () => {
    await build();

    expect(manifest.storeImageNameAndTagAsync).toHaveBeenCalledTimes(1);
    expect(manifest.storeImageNameAndTagAsync).toHaveBeenCalledWith(
      inputs.image_name,
      fqImageName,
      imageTag
    );
  });
});
