const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const git = require('./git');
const uploader = require('./uploader');

const manifestGitStateKey = "manifest_git_state";
const manifestImagesKey = "manifest_images";

const runAsync = async () => {
  try {

    const gitState = await git.generateGitStateAsync();

    core.debug('Generated git state: ', gitState);

    // Write the git state to file:
    await fs.promises.writeFile(manifestGitStateKey, JSON.stringify(gitState, null, 2));

    if (!(await uploader.uploadArtifactAsync(manifestGitStateKey, manifestGitStateKey))) {
      throw Error('Unable to upload git state artifact');
    }
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = { runAsync }
