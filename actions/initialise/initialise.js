const core = require("@actions/core");
const git = require("@eroad/gh-common/git");

const inputMainBranchName = "main_branch_name";

const runAsync = async () => {
  try {
    const mainBranchName = core.getInput(inputMainBranchName);

    const gitState = await git.generateGitStateAsync(mainBranchName);
    await git.persistGitStateAsync(gitState);
  } catch (error) {
    core.setFailed(error.message);
  }
};

module.exports = { runAsync };
