const core = require("@actions/core");
const docker = require("@eroad/gh-common/docker");
const git = require("@eroad/gh-common/git");
const manifest = require("@eroad/gh-common/manifest");

module.exports = {
  run: async () => {
    const gitState = await git.loadGitStateAsync();

    const imageNames = core.getInput("image_names");
    const arrImageNames = imageNames.split(",");

    arrImageNames.forEach(async (imageName) => {
      const fqImageNameAndTag = await manifest.getImageNameAndTagAsync(imageName);
      core.info(`Running docker image ${fqImageNameAndTag}`);
      await docker.runAsync(`${fqImageNameAndTag}`);
    });
  },
};
