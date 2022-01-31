const core = require("@actions/core");
const docker = require("@eroad/gh-common/docker");
const git = require("@eroad/gh-common/git");
const imageNamer = require("@eroad/gh-common/image-namer");

module.exports = {
  run: async () => {
    const gitState = await git.loadGitStateAsync();

    const imageNames = core.getInput("image_names");
    const arrImageNames = imageNames.split(",");
    // loads manifest which is exported from manifest.js
    const environment = core.getInput("environment");

    arrImageNames.forEach(async () => {
      const fqImageName = imageNamer.loadFqImageName(imageName);
      const imageTag = imageNamer.generateImageTag(gitState);

      await docker.runAsync(`${fqImageName}:${imageTag}`);
    })
  },
};
