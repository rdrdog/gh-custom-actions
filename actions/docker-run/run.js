const core = require("@actions/core");
const docker = require("@eroad/gh-common/docker");
const git = require("@eroad/gh-common/git");
const manifest = require("@eroad/gh-common/manifest");

module.exports = {
  run: async () => {
    const imageNames = core.getInput("image_names");
    const arrImageNames = imageNames.split(",").map(x => x.trim());
    
    for (let i = 0; i < arrImageNames.length; i++) {
        const fqImageNameAndTag = await manifest.getImageNameAndTagAsync(arrImageNames[i]);
        await docker.runAsync(fqImageNameAndTag);
      };
  },
};
