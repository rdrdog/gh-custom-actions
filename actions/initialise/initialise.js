const artifact = require('@actions/artifact');
const core = require('@actions/core');
const fs = require('fs');
const git = require('./git');

const manifestGitStateKey = "manifest_git_state";

const runAsync = async () => {
  try {

    // await exec.exec('mkdir manifest_images');
    // await exec.exec('touch manifest_images/.keep');

    const gitState = await git.generateGitStateAsync();

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

module.exports = { runAsync }
