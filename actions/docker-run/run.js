const core = require("@actions/core");
const docker = require("@eroad/gh-common/docker");
const git = require("@eroad/gh-common/git");
const imageNamer = require("@eroad/gh-common/image-namer");

module.exports = {
  run: async () => {
    const gitState = await git.loadGitStateAsync();

    const imageName = core.getInput("image_names");
    // loads manifest which is exported from manifest.js
    const environment = core.getInput("environment");
    const fqImageName = imageNamer.loadFqImageName(imageName);
    const imageTag = imageNamer.generateImageTag(gitState);

    // loop here
    await docker.runAsync(`${fqImageName}:${imageTag}`);
  },
};
