const core = require("@actions/core");
const constants = require("./constants");

module.exports = {
  loadFqImageName: (registry, imageName) => {
    if (!process.env.STACK_NAME) {
      throw new Error(
        "STACK_NAME env var must be defined for generating container image names"
      );
    }

    // set the container registry to have a trailing slash, unless it is empty
    registry = registry.trim();
    if (registry != "" && !registry.endsWith("/")) {
      registry += "/";
    }
    if (!constants.isCI()) {
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
    if (!constants.isCI()) {
      core.info("Adding unix epoch to image tag for local builds");
      imageTag += "-" + new Date().getTime();
    }
    return imageTag;
  },
};
