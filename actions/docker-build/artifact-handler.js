const artifact = require('@actions/artifact');
const core = require('@actions/core');
const fs = require('fs');
const path = require('path');

const constants = require('./constants');

// TODO - pattern to share these functions across actions
// ------------------------------------------------------
const downloadArtifactAsync = async (key) => {
  const artifactClient = artifact.create();

  const downloadOptions = {
    createArtifactFolder: false
  };

  const downloadResponse = await artifactClient.downloadArtifact(
    key,
    '',
    downloadOptions
  );

  core.info(`Artifact ${downloadResponse.artifactName} was downloaded to ${downloadResponse.downloadPath}`);
}

const uploadArtifactAsync = async (key, path) => {
  // Publish the git state artifact:
  const artifactClient = artifact.create()
  const options = {
    continueOnError: false,
    retentionDays: 1
  };

  const uploadResponse = await artifactClient.uploadArtifact(
    key,
    [path],
    './',
    options
  )

  if (uploadResponse.failedItems.length > 0) {
    core.setFailed(`An error was encountered when uploading ${uploadResponse.artifactName}. There were ${uploadResponse.failedItems.length} items that failed to upload.`);
    return false;
  }

  core.info(`Artifact ${uploadResponse.artifactName} has been successfully uploaded!`)
  return true;
}
// ------------------------------------------------------

module.exports = {
  loadGitStateAsync: async () => {

    await downloadArtifactAsync(constants.manifestGitStateKey);
    const fileContents = await fs.promises.readFile(constants.manifestGitStateKey, { encoding: 'utf8' });
    core.info('read git state contents: ' + fileContents);

    // gitState contains these fields:
    // {
    //   commitSha: '',
    //   branchName: '',
    //   mainBranchForkPoint: '',
    //   fileChangesInBranch: []
    // };

    return JSON.parse(fileContents);
  },

  storeImageNameAndTagAsync: async (fqImageName, imageTag) => {
    //await downloadArtifactAsync(constants.manifestImagesKey);
    //const imageTagFile = path.join(constants.manifestImagesKey, core.getInput(constants.inputImageName));
    const imageTagFile = core.getInput(constants.inputImageName);
    await fs.promises.writeFile(imageTagFile, `${fqImageName}:${imageTag}`)

    await uploadArtifactAsync(constants.manifestImagesKey, imageTagFile);
  }

  /*
#   - name: fetch manifest images
#     uses: actions/download-artifact@v2
#     with:
#       name: manifest_images
#       path: manifest_images

#   - name: store image name and tag in manifest
#     shell: bash
#     run: |
#       echo "${{ steps.sanitisedInputs.outputs.FQ_IMAGE_NAME }}:${{ steps.sanitisedInputs.outputs.IMAGE_TAG }}" > manifest_images/${{ inputs.image_name }}

#   - uses: actions/upload-artifact@v2
#     with:
#       name: manifest_images
#       path: manifest_images/**
  */

};
