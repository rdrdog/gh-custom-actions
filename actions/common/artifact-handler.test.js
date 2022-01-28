const artifact = require("@actions/artifact");
const core = require("@actions/core");
const { expect } = require("@jest/globals");

jest.mock("@actions/artifact");
jest.mock("@actions/core");

const artifactHandler = require("./artifact-handler");

describe("uploadArtifactAsync", () => {
  const key = "someUploadKey";
  const path = "file.txt";
  const mockArtifactClient = {
    uploadArtifact: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    artifact.create.mockReturnValue(mockArtifactClient);
  });

  it("uploads the specified files", async () => {
    mockArtifactClient.uploadArtifact.mockResolvedValue({
      failedItems: [],
    });

    const result = await artifactHandler.uploadArtifactAsync(key, path);

    expect(result).toBeTruthy();
    expect(mockArtifactClient.uploadArtifact).toHaveBeenCalledTimes(1);
    expect(mockArtifactClient.uploadArtifact).toHaveBeenCalledWith(
      key,
      [path],
      "./",
      {
        continueOnError: false,
        retentionDays: 1,
      }
    );
  });

  it("fails when the upload fails", async () => {
    mockArtifactClient.uploadArtifact.mockResolvedValue({
      failedItems: ["something"],
    });
    const result = await artifactHandler.uploadArtifactAsync(key, path);

    expect(result).toBeFalsy();
    expect(core.setFailed).toHaveBeenCalledTimes(1);
  });
});
