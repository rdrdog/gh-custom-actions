const core = require('@actions/core');
const path = require('path');
const docker = require('@eroad/gh-common/docker');

const artifactHandler = require('./artifact-handler');
const imageNamer = require('./image-namer');
const constants = require('./constants');

module.exports = {
  build: async () => {
    try {

      const gitState = await artifactHandler.loadGitStateAsync();

      const imageName = core.getInput(constants.inputImageName);
      const fqImageName = imageNamer.loadFqImageName(imageName);
      const imageTag = imageNamer.generateImageTag(gitState);

      core.info('FQImageName: ' + fqImageName);
      core.info('imageTag: ' + imageTag);

      // - TODO: determine if container should be build

      // - pull latest image for cache
      if (process.env.ACT !== "true") {
        await docker.pullAsync(`${imageTag}:latest`);
      }

      // generate our build args:
      const buildArgs = [
        `${constants.buildArgContainerBuildNumber}="${gitState.buildNumber}"`,
        `${constants.buildArgContainerCommitSha}="${gitState.commitSha}"`,
      ]

      // determine our build context:
      const dockerfilePath = core.getInput(constants.inputDockerfile);
      let contextPath = core.getInput(constants.inputContext);
      if (!contextPath) {
        contextPath = path.dirname(dockerfilePath);
      }

      await docker.buildAsync(
        dockerfilePath,
        contextPath,
        fqImageName,
        imageTag,
        buildArgs
      );

      if (process.env.ACT !== "true") {
        await docker.pushAsync(`${fqImageName}:${imageTag}`)
        await docker.pushAsync(`${fqImageName}:latest`)
      } else {
        core.info(`⏭ skipping container push for ${imageName}`)
      }

      await artifactHandler.storeImageNameAndTagAsync(imageName, fqImageName, imageTag);

    } catch (error) {
      core.setFailed(error.message);
    }
  }
}
