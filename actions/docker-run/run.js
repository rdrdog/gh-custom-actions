const core = require("@actions/core");
const path = require("path");
const docker = require("@eroad/gh-common/docker");
const artifactHandler = require("@eroad/gh-common/artifact-handler");
const imageNamer = require("@eroad/gh-common/image-namer");

module.exports = {
  run: async () => {
    const gitState = await artifactHandler.loadGitStateAsync();

    const imageName = core.getInput("image_names");
    // loads manifest which is exported from manifest.js
    const environment = core.getInput("environment");
    const fqImageName = imageNamer.loadFqImageName(imageName);
    const imageTag = imageNamer.generateImageTag(gitState);

    // loop here
    await docker.runAsync(`${fqImageName}:${imageTag}`)
  },
};
