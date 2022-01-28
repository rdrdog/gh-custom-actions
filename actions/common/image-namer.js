const core = require("@actions/core");
const constants = require("./constants");

module.exports = {
  loadFqImageName: (imageName) => {
    let registry = core.getInput(constants.inputRegistry).trim();
    // set the container registry to have a trailing slash, unless it is empty
    if (registry != "" && !registry.endsWith("/")) {
      registry += "/";
    }
    if (process.env.ACT === "true") {
      core.info(
        "Setting container registry to empty string for local container builds"
      );
      registry = "";
    }

    return `${registry}${process.env.STACK_NAME}/${imageName}`;
  },

  generateImageTag: (gitState) => {
    // Define out image tag
    let imageTag = gitState.commitSha.substring(0, 7);
    if (process.env.ACT === "true") {
      core.info("Adding unix epoch to image tag for local builds");
      imageTag += "-" + new Date().getTime();
    }
    return imageTag;
  },
};
