const core = require('@actions/core');
const github = require('@actions/github');
const exec = require('@actions/exec');

const artifactHandler = require('./artifact-handler');
const imageNamer = require('./image-namer');

const runAsync = async () => {
  try {

    const gitState = await artifactHandler.loadGitStateAsync();

    const fqImageName = imageNamer.loadFqImageName();
    const imageTag = imageNamer.generateImageTag(gitState);

    core.info('FQImageName: ' + fqImageName);
    core.info('imageTag: ' + imageTag);

    // - TODO: determine if container should be build

    // - TODO: pull latest image for cache
    // - TODO: docker build
    // - TODO: push images

    await artifactHandler.storeImageNameAndTagAsync(fqImageName, imageTag);

    // - TODO: fetch manifest images
    // - TODO: store image name and tag in manifest

  } catch (error) {
    core.setFailed(error.message);
  }
}

runAsync();
