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
    // Create the manifest images folder and a .keep file to make sure it's uploaded as an artifact
    // await fs.promises.mkdir(manifestImagesKey, { recursive: true });
    // const manifestImagesPlaceholderFile = path.join(manifestImagesKey, '.keep');
    // await fs.promises.writeFile(manifestImagesPlaceholderFile, '');

    if (!(await uploader.uploadArtifactAsync(manifestGitStateKey, manifestGitStateKey))) {
      throw Error('Unable to upload git state artifact');
    }

    // if (!(await uploader.uploadArtifactAsync(manifestImagesKey, manifestImagesPlaceholderFile))) {
    //   throw Error('Unable to upload manifestImages folder');
    // }
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = { runAsync }
