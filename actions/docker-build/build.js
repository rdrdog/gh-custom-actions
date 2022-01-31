const core = require("@actions/core");
const path = require("path");
const docker = require("@eroad/gh-common/docker");

const git = require("@eroad/gh-common/git");
const imageNamer = require("@eroad/gh-common/image-namer");
const constants = require("@eroad/gh-common/constants");
const manifest = require("@eroad/gh-common/manifest");

const inputImageName = "image_name";
const inputDockerfile = "dockerfile";
const inputContext = "context";

module.exports = {
  build: async () => {
    try {
      const imageName = core.getInput(inputImageName);

      const gitState = await git.loadGitStateAsync();

      const fqImageName = imageNamer.loadFqImageName(imageName);
      const imageTag = imageNamer.generateImageTag(gitState);

      core.info("FQImageName: " + fqImageName);
      core.info("imageTag: " + imageTag);

      // - TODO: determine if container should be build

      // - pull latest image for cache
      if (constants.isCI()) {
        await docker.pullAsync(`${imageTag}:latest`);
      }

      // generate our build args:
      const buildArgs = [
        `${constants.buildArgContainerBuildNumber}="${gitState.buildNumber}"`,
        `${constants.buildArgContainerCommitSha}="${gitState.commitSha}"`,
      ];

      // determine our build context:
      const dockerfilePath = core.getInput(inputDockerfile);
      let contextPath = core.getInput(inputContext);
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

      if (constants.isCI()) {
        await docker.pushAsync(`${fqImageName}:${imageTag}`);
        await docker.pushAsync(`${fqImageName}:latest`);
      } else {
        core.info(`⏭ skipping container push for ${imageName}`);
      }

      await manifest.storeImageNameAndTagAsync(
        imageName,
        fqImageName,
        imageTag
      );
    } catch (error) {
      core.setFailed(error.message);
    }
  },
};
