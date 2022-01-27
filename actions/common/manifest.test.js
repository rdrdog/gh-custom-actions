const fs = require("fs");
const artifactHandler = require("./artifact-handler");

jest.mock("@actions/core");
jest.mock("./artifact-handler");

jest.mock("fs", () => {
  const originalModule = jest.requireActual("fs");

  //Mock the default export and named export 'foo'
  return {
    __esModule: true,
    ...originalModule,
    promises: {
      readFile: jest.fn(),
      writeFile: jest.fn(),
    },
  };
});

const manifest = require("./manifest");

describe("getImageNameAndTagAsync", () => {

  const imageName = "api";

  beforeEach(() => {
    jest.resetAllMocks();

  });

  it("downloads the manifest images artifacts only one time", async () => {
    await manifest.getImageNameAndTagAsync(imageName);
    await manifest.getImageNameAndTagAsync(imageName);

    expect(artifactHandler.downloadArtifactAsync).toHaveBeenCalledTimes(1);
    expect(artifactHandler.downloadArtifactAsync).toHaveBeenCalledWith('manifest_images');
  });

  it("reads and returns the contents of the named image file", async () => {
    const imageNameAndTag = "something/api:abc123de";

    fs.promises.readFile.mockResolvedValue(imageNameAndTag);

    const result = await manifest.getImageNameAndTagAsync(imageName);

    expect(fs.promises.readFile).toHaveBeenCalledTimes(1);
    expect(fs.promises.readFile).toHaveBeenCalledWith(imageName, { 'encoding': 'utf8' });

    expect(result).toBe(imageNameAndTag);
  });

  it("throws an exception if no file exists for the specified image name", async () => {

    fs.promises.readFile.mockRejectedValue(new Error());

    await expect(manifest.getImageNameAndTagAsync(imageName))
      .rejects
      .toThrow();

  });

});

describe("storeImageNameAndTagAsync", () => {

  const imageName = "api";
  const fqImageName = "ecr.example.org/example/api";
  const imageTag = "abc123de";

  beforeEach(() => {
    jest.resetAllMocks();
    // git.generateGitStateAsync.mockResolvedValue(gitState);
  });

  it("writes the image details to file", async () => {

    await manifest.storeImageNameAndTagAsync(imageName, fqImageName, imageTag);

    expect(fs.promises.writeFile).toHaveBeenCalledTimes(1);
    expect(fs.promises.writeFile).toHaveBeenCalledWith(imageName, `${fqImageName}:${imageTag}`);
  });

  it("uploads the image file", async () => {

    await manifest.storeImageNameAndTagAsync(imageName, fqImageName, imageTag);

    expect(artifactHandler.uploadArtifactAsync).toHaveBeenCalledTimes(1);
    expect(artifactHandler.uploadArtifactAsync).toHaveBeenCalledWith('manifest_images', imageName);
  });

});
