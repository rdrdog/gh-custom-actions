const core = require("@actions/core");
const git = require("@eroad/gh-common/git");

jest.mock("@actions/core");
jest.mock("@eroad/gh-common/git");

const { runAsync } = require("./initialise");

describe("initialise", () => {
  const gitState = { branchName: "main" };
  const inputMainBranchNameValue = "main";

  beforeEach(() => {
    jest.resetAllMocks();
    core.getInput.mockReturnValue(inputMainBranchNameValue);
    git.generateGitStateAsync.mockResolvedValue(gitState);
  });

  it("fetches the git state", async () => {

    await runAsync();
    expect(git.generateGitStateAsync).toHaveBeenCalledTimes(1);
    expect(git.generateGitStateAsync).toHaveBeenCalledWith(inputMainBranchNameValue);
  });

  it("persists the git state", async () => {
    await runAsync();

    expect(git.persistGitStateAsync).toHaveBeenCalledTimes(1);
    expect(git.persistGitStateAsync).toHaveBeenCalledWith(gitState);
  });

  it("fails when the upload fails", async () => {
    git.generateGitStateAsync.mockRejectedValue(new Error());

    await runAsync();

    expect(core.setFailed).toHaveBeenCalledTimes(1);
  });
});
