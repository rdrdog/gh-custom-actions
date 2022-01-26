const exec = require('@actions/exec');
const artifact = require('@actions/artifact');
const core = require('@actions/core');
const fs = require('fs');

const manifestGitStateKey = "manifest_git_state";

const generateGitState = async () => {
  const gitState = {
    commitSha: '',
    branchName: '',
    mainBranchForkPoint: '',
    fileChangesInBranch: []
  };

  await exec.exec('touch manifest_git_state');
  await exec.exec('mkdir manifest_images');
  await exec.exec('touch manifest_images/.keep');

  const gitCommitShaOutput = await exec.getExecOutput('git', ['rev-parse', 'HEAD']);
  commitSha = gitCommitShaOutput.stdout.trim();
  gitState.commitSha = commitSha;
  //await exec.exec(`echo "GIT_COMMIT_SHA=${commitSha}" >> manifest_git_state`);

  // Get branch name
  gitState.branchName = process.env.GITHUB_HEAD_REF
  if (!gitState.branchName) {
    gitState.branchName = `${process.env.GITHUB_REF}#refs/heads/`
  }
  //await exec.exec(`echo "GIT_BRANCH_NAME=${branchName}" >> manifest_git_state`);

  // Get main branch fork point
  if (process.env.ACT) {
    mainBranchPath = core.getInput('main_branch_name');
  } else {
    mainBranchPath = `remotes/origin/${core.getInput('main_branch_name')}`;
  }

  const mergeBaseExecOutput = await exec.getExecOutput('git', ['merge-base', '--octopus', mainBranchPath, 'HEAD']);
  mainBranchForkPoint = mergeBaseExecOutput.stdout.trim();
  gitState.mainBranchForkPoint = mainBranchForkPoint;
  //await exec.exec(`echo "GIT_MAIN_BRANCH_FORK_POINT=${mainBranchForkPoint}" >> manifest_git_state`);

  // Get changes on this branch:
  if (commitSha != '' && mainBranchForkPoint != '') {
    fileChangesInBranchOutput = await exec.getExecOutput('git', ['--no-pager', 'diff', '--name-only', `${commitSha}:./`]);
    fileChangesInBranch = fileChangesInBranchOutput.stdout.trim();
    // fileChangesInBranch=$(git --no-pager diff --name-only $commitSha:./)
    gitState.fileChangesInBranch = fileChangesInBranch.split("\n");
    //await exec.exec(`echo "GIT_DIFF_LIST=$${fileChangesInBranch}" >> manifest_git_state`);
  }

  return gitState;
}

const run = async () => {
  try {

    const gitState = await generateGitState();

    core.debug('Generated git state: ', gitState);

    // Write the git state to file:
    await fs.promises.writeFile(manifestGitStateKey, JSON.stringify(gitState, null, 2));

    // Publish the git state artifact:
    const artifactClient = artifact.create()
    const options = {
      continueOnError: false,
      retentionDays: 1
    };

    const uploadResponse = await artifactClient.uploadArtifact(
      manifestGitStateKey,
      [manifestGitStateKey],
      './',
      options
    )

    if (uploadResponse.failedItems.length > 0) {
      core.setFailed(`An error was encountered when uploading ${uploadResponse.artifactName}. There were ${uploadResponse.failedItems.length} items that failed to upload.`);
    } else {
      core.info(`Artifact ${uploadResponse.artifactName} has been successfully uploaded!`)
    }
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run();

    /*

#   - uses: actions/upload-artifact@v2
#     with:
#       name: manifest_images
#       path: manifest_images/*
*/
