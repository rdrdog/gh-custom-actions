const core = require('@actions/core');

module.exports = {

  loadFqImageName: () => {
    let registry = core.getInput('registry').trim();
      // set the container registry to have a trailing slash, unless it is empty
      if (registry != '' && !registry.endsWith('/')) {
        registry += '/';
      }
      if (process.env.ACT === "true") {
        core.info('Setting container registry to empty string for local container builds');
        registry = '';
      }

      return `${registry}${process.env.STACK_NAME}/${core.getInput('image_name')}`;
  },

  generateImageTag: (gitState) => {
    // Define out image tag
    let imageTag = gitState.commitSha.substring(0, 7);
    if (process.env.ACT === "true") {
      core.info('Adding unix epoch to image tag for local builds');
      imageTag += '-' + new Date().getTime();
    }
    return imageTag;
  }

};
