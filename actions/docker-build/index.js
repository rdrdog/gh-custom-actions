const artifact = require('@actions/artifact');
const core = require('@actions/core');
const github = require('@actions/github');
const exec = require('@actions/exec');
const fs = require('fs');


const manifestGitStateKey = "manifest_git_state";
const loadGitStateAsync = async () => {
  const artifactClient = artifact.create();

  const downloadOptions = {
    createArtifactFolder: false
  };

  const downloadResponse = await artifactClient.downloadArtifact(
    manifestGitStateKey,
    '',
    downloadOptions
  );

  core.info(`Artifact ${downloadResponse.artifactName} was downloaded to ${downloadResponse.downloadPath}`);

  const fileContents = await fs.promises.readFile(manifestGitStateKey, { encoding: 'utf8' });
  core.info('read git state contents: ' + fileContents);

  return JSON.parse(fileContents);
}

const loadFqImageName = () => {
  let registry = core.getInput('registry').trim();
    // set the container registry to have a trailing slash, unless it is empty
    if (registry != '' && !registry.endsWith('/')) {
      registry += '/';
    }
    if (process.env.ACT === "true") {
      core.info('Setting container registry to empty string for local container builds');
      registry = '';
    }

    return `${registry}${process.env.STACK_NAME}/${core.getInput('image_name')}`;
}

const generateImageTag = (gitState) => {
  // Define out image tag
  let imageTag = gitState.commitSha.substring(0, 7);
  if (process.env.ACT === "true") {
    core.info('Adding unix epoch to image tag for local builds');
    imageTag += '-' + new Date().getTime();
  }
  return imageTag;
}

let gitState = {
  commitSha: '',
  branchName: '',
  mainBranchForkPoint: '',
  fileChangesInBranch: []
};

const runAsync = async () => {
  try {

    gitState = await loadGitStateAsync();

    const fqImageName = loadFqImageName();
    const imageTag = generateImageTag(gitState);

    core.info('FQImageName: ' + fqImageName);
    core.info('imageTag: ' + imageTag);

    // - TODO: determine if container should be build
    // - TODO: pull latest image for cache
    // - TODO: docker build
    // - TODO: push images
    // - TODO: fetch manifest images
    // - TODO: store image name and tag in manifest

  } catch (error) {
    core.setFailed(error.message);
  }
}

runAsync();
