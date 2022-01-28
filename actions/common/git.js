const core = require("@actions/core");
const exec = require("@actions/exec");
const fs = require("fs");

const artifactHandler = require("./artifact-handler");
const constants = require("./constants");

const manifestGitStateKey = "manifest_git_state";

const getCommitShaAsync = async () => {
  const gitCommitShaOutput = await exec.getExecOutput("git", [
    "rev-parse",
    "HEAD",
  ]);
  return gitCommitShaOutput.stdout.trim();
};

const getBranchName = () => {
  let branchName = process.env.GITHUB_HEAD_REF;
  if (!branchName) {
    branchName = `${process.env.GITHUB_REF}#refs/heads/`;
  }

  return branchName;
};

const getMainBranchForkPointAsync = async (mainBranchName) => {
  // Get main branch fork point
  if (constants.isCI()) {
    mainBranchPath = `remotes/origin/${mainBranchName}`;
  } else {
    mainBranchPath = mainBranchName;
  }

  const mergeBaseExecOutput = await exec.getExecOutput("git", [
    "merge-base",
    "--octopus",
    mainBranchPath,
    "HEAD",
  ]);
  return mergeBaseExecOutput.stdout.trim();
};

const getFileChangesInBranchAsync = async (
  originCommitSha,
  currentCommitSha
) => {
  // Get changes on this branch - but only if we some commit shas
  if (!originCommitSha || !currentCommitSha) {
    return [];
  }

  diffArgs =
    constants.isCI()
      ? [
          "--no-pager",
          "diff",
          "--name-only",
          `${originCommitSha}..${currentCommitSha}`,
        ]
      : ["--no-pager", "diff", "--name-only", `${originCommitSha}:./`];

  fileChangesInBranchOutput = await exec.getExecOutput("git", diffArgs);
  fileChangesInBranch = fileChangesInBranchOutput.stdout.trim();
  return fileChangesInBranch.split("\n");
};

module.exports = {
  _getFileChangesInBranchAsync: getFileChangesInBranchAsync, // exposed for testing in isolation
  generateGitStateAsync: async (mainBranchName) => {
    const gitState = {
      commitSha: "",
      branchName: "",
      mainBranchForkPoint: "",
      fileChangesInBranch: [],
    };

    gitState.commitSha = await getCommitShaAsync();
    gitState.branchName = getBranchName();
    gitState.buildNumber = process.env.GITHUB_RUN_ID;
    gitState.mainBranchForkPoint = await getMainBranchForkPointAsync(mainBranchName);
    gitState.fileChangesInBranch = await getFileChangesInBranchAsync(
      gitState.mainBranchForkPoint,
      gitState.commitSha
    );

    core.debug("Generated git state: ", gitState);

    return gitState;
  },

  persistGitStateAsync: async (gitState) => {

    // Write the git state to file:
    await fs.promises.writeFile(
      manifestGitStateKey,
      JSON.stringify(gitState, null, 2)
    );

    if (
      !(await artifactHandler.uploadArtifactAsync(
        manifestGitStateKey,
        manifestGitStateKey
      ))
    ) {
      throw Error("Unable to upload git state artifact");
    }
  },

  loadGitStateAsync: async () => {
    await artifactHandler.downloadArtifactAsync(manifestGitStateKey);
    const fileContents = await fs.promises.readFile(
      manifestGitStateKey,
      { encoding: "utf8" }
    );
    core.info("read git state contents: " + fileContents);

    // gitState contains these fields:
    // {
    //   commitSha: '',
    //   branchName: '',
    //   buildNumber: '',
    //   mainBranchForkPoint: '',
    //   fileChangesInBranch: []
    // };

    return JSON.parse(fileContents);
  }
};
