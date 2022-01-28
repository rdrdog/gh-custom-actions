const fs = require("fs");
const core = require("@actions/core");
const artifactHandler = require("@eroad/gh-common/artifact-handler");
const git = require("@eroad/gh-common/git");

const manifestGitStateKey = "manifest_git_state";

const runAsync = async () => {
  try {
    const gitState = await git.generateGitStateAsync();

    core.debug("Generated git state: ", gitState);

    // Write the git state to file:
    await fs.promises.writeFile(
      manifestGitStateKey,
      JSON.stringify(gitState, null, 2)
    );

    if (
      !(await artifactHandler.uploadArtifactAsync(
        manifestGitStateKey,
        manifestGitStateKey
      ))
    ) {
      throw Error("Unable to upload git state artifact");
    }
  } catch (error) {
    core.setFailed(error.message);
  }
};

module.exports = { runAsync };
