const fs = require("fs");
const exec = require("@actions/exec");

const artifactHandler = require("./artifact-handler");
const constants = require("./constants");

jest.mock("@actions/core");
jest.mock("@actions/exec");
jest.mock("./artifact-handler");
jest.mock("./constants");

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

const git = require("./git");

beforeEach(() => {
  jest.resetAllMocks();
  constants.isCI.mockReturnValue(true);
});

describe("generateGitStateAsync", () => {
  const mainBranchName = "main";

  beforeEach(() => {
    exec.getExecOutput.mockResolvedValue({ stdout: "" });
  });

  afterEach(() => {
    process.env.GITHUB_HEAD_REF = "";
    process.env.GITHUB_REF = "";
    process.env.GITHUB_RUN_ID = "";
  });

  it("fetches the commit sha", async () => {
    const execOutput = "abcdef123 \n"; // add a space and newline to the end to make sure it's trimmed
    exec.getExecOutput.mockResolvedValue({ stdout: execOutput });

    const result = await git.generateGitStateAsync(mainBranchName);

    expect(result.commitSha).toBe("abcdef123");
  });

  describe("gets the branch name", () => {
    it("gets the branch name from GITHUB_HEAD_REF", async () => {
      process.env.GITHUB_HEAD_REF = "main";

      const result = await git.generateGitStateAsync(mainBranchName);

      expect(result.branchName).toBe("main");
    });

    it("gets the branch name from GITHUB_REF if GITHUB_HEAD_REF is empty", async () => {
      process.env.GITHUB_REF = "thing";

      const result = await git.generateGitStateAsync(mainBranchName);

      expect(result.branchName).toBe("thing#refs/heads/");
    });
  });

  it("gets the build number from GITHUB_RUN_ID", async () => {
    process.env.GITHUB_RUN_ID = "123";

    const result = await git.generateGitStateAsync(mainBranchName);

    expect(result.buildNumber).toBe("123");
  });

  describe("fetches the main branch fork point", () => {
    beforeEach(() => {
      const execOutput = "abcdef123 \n"; // add a space and newline to the end to make sure it's trimmed
      exec.getExecOutput.mockResolvedValue({ stdout: execOutput });
    });

    it("uses the branch name as the mainBranchPath when running locally", async () => {
      constants.isCI.mockReturnValue(false);

      const result = await git.generateGitStateAsync(mainBranchName);

      expect(result.mainBranchForkPoint).toBe("abcdef123");
      expect(exec.getExecOutput).toHaveBeenCalledWith("git", [
        "merge-base",
        "--octopus",
        mainBranchName,
        "HEAD",
      ]);
    });

    it("uses the branch name with remotes/origin prefix as the mainBranchPath when running in CI", async () => {
      const result = await git.generateGitStateAsync(mainBranchName);

      expect(result.mainBranchForkPoint).toBe("abcdef123");
      expect(exec.getExecOutput).toHaveBeenCalledWith("git", [
        "merge-base",
        "--octopus",
        "remotes/origin/main",
        "HEAD",
      ]);
    });
  });

  describe("getFileChangesInBranchAsync", () => {
    const originCommitSha = "abc";
    const currentCommitSha = "123";

    beforeEach(() => {
      const execOutput = "file1.js\nfile2.js\nfile3.js";
      exec.getExecOutput.mockResolvedValue({ stdout: execOutput });
    });

    it("returns an empty array if either commit sha is empty", async () => {
      expect(
        await git._getFileChangesInBranchAsync("", currentCommitSha)
      ).toStrictEqual([]);
      expect(
        await git._getFileChangesInBranchAsync(originCommitSha, "")
      ).toStrictEqual([]);
      expect(await git._getFileChangesInBranchAsync("", "")).toStrictEqual([]);
    });

    it("returns an array of files from the git diff output", async () => {
      const result = await git._getFileChangesInBranchAsync(
        originCommitSha,
        currentCommitSha
      );

      expect(result).toStrictEqual(["file1.js", "file2.js", "file3.js"]);
    });

    it("uses the origin sha when running in local", async () => {
      constants.isCI.mockReturnValue(false);

      await git._getFileChangesInBranchAsync(originCommitSha, currentCommitSha);

      expect(exec.getExecOutput).toHaveBeenCalledWith("git", [
        "--no-pager",
        "diff",
        "--name-only",
        "abc:./",
      ]);
    });

    it("uses the diff between the origin and the current commit when running in CI", async () => {
      await git._getFileChangesInBranchAsync(originCommitSha, currentCommitSha);

      expect(exec.getExecOutput).toHaveBeenCalledWith("git", [
        "--no-pager",
        "diff",
        "--name-only",
        "abc..123",
      ]);
    });
  });
});

describe("persistGitStateAsync", () => {
  const gitState = { branchName: "main" };

  beforeEach(() => {
    jest.resetAllMocks();
    artifactHandler.uploadArtifactAsync.mockResolvedValue(true);
  });

  it("writes the git state to file", async () => {
    await git.persistGitStateAsync(gitState);

    expect(fs.promises.writeFile).toHaveBeenCalledTimes(1);
    expect(fs.promises.writeFile.mock.calls[0][0]).toBe("manifest_git_state");
    const writtenState = JSON.parse(fs.promises.writeFile.mock.calls[0][1]);
    expect(writtenState).toStrictEqual(gitState);
  });

  it("uploads the git state as an artifact", async () => {
    await git.persistGitStateAsync(gitState);

    expect(artifactHandler.uploadArtifactAsync).toHaveBeenCalledTimes(1);
    expect(artifactHandler.uploadArtifactAsync).toHaveBeenCalledWith(
      "manifest_git_state",
      "manifest_git_state"
    );
  });

  it("throws when the upload fails", async () => {
    artifactHandler.uploadArtifactAsync.mockResolvedValue(false);

    await expect(git.persistGitStateAsync(gitState)).rejects.toThrow();
  });
});

describe("loadGitStateAsync", () => {
  const stubGitStateContents = `{ "branchName": "main" }`;

  beforeEach(() => {
    jest.resetAllMocks();
    fs.promises.readFile.mockResolvedValue(stubGitStateContents);
  });

  it("downloads the git state", async () => {
    await git.loadGitStateAsync();

    expect(artifactHandler.downloadArtifactAsync).toHaveBeenCalledTimes(1);
    expect(artifactHandler.downloadArtifactAsync).toHaveBeenCalledWith(
      "manifest_git_state"
    );
  });

  it("reads and returns the git state", async () => {
    const result = await git.loadGitStateAsync();

    expect(fs.promises.readFile).toHaveBeenCalledTimes(1);
    expect(fs.promises.readFile).toHaveBeenCalledWith("manifest_git_state", {
      encoding: "utf8",
    });
    expect(result.branchName).toBe("main");
  });
});
