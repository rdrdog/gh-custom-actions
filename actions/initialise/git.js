const core = require('@actions/core');
const exec = require('@actions/exec');

const getCommitShaAsync = async () => {
  const gitCommitShaOutput = await exec.getExecOutput('git', ['rev-parse', 'HEAD']);
  return gitCommitShaOutput.stdout.trim();
}

const getBranchName = () => {
  let branchName = process.env.GITHUB_HEAD_REF
  if (!branchName) {
    branchName = `${process.env.GITHUB_REF}#refs/heads/`
  }

  return branchName;
}

const getMainBranchForkPointAsync = async () => {
    // Get main branch fork point
    if (process.env.ACT === "true") {
      mainBranchPath = core.getInput('main_branch_name');
    } else {
      mainBranchPath = `remotes/origin/${core.getInput('main_branch_name')}`;
    }

    const mergeBaseExecOutput = await exec.getExecOutput('git', ['merge-base', '--octopus', mainBranchPath, 'HEAD']);
    return mergeBaseExecOutput.stdout.trim();
}

const getFileChangesInBranchAsync = async (originCommitSha, currentCommitSha) => {

  // Get changes on this branch - but only if we some commit shas
  if (!originCommitSha || !currentCommitSha) {
    return [];
  }

  diffArgs = process.env.ACT === "true"
    ? ['--no-pager', 'diff', '--name-only', `${originCommitSha}:./`]
    : ['--no-pager', 'diff', '--name-only', `${originCommitSha}..${currentCommitSha}`]

  fileChangesInBranchOutput = await exec.getExecOutput('git', diffArgs);
  fileChangesInBranch = fileChangesInBranchOutput.stdout.trim();
  return fileChangesInBranch.split("\n");
}

module.exports = {
  generateGitStateAsync: async () => {
    const gitState = {
      commitSha: '',
      branchName: '',
      mainBranchForkPoint: '',
      fileChangesInBranch: []
    };

    gitState.commitSha = await getCommitShaAsync();
    gitState.branchName = getBranchName();
    gitState.buildNumber = process.env.GITHUB_RUN_ID
    gitState.mainBranchForkPoint = await getMainBranchForkPointAsync();
    gitState.fileChangesInBranch = await getFileChangesInBranchAsync(gitState.mainBranchForkPoint, gitState.commitSha);

    return gitState;
  }
}
