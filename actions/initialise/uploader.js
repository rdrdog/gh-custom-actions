const artifact = require("@actions/artifact");
const core = require("@actions/core");

module.exports = {
  uploadArtifactAsync: async (key, path) => {
    // Publish the git state artifact:
    const artifactClient = artifact.create();
    const options = {
      continueOnError: false,
      retentionDays: 1,
    };

    const uploadResponse = await artifactClient.uploadArtifact(
      key,
      [path],
      "./",
      options
    );

    if (uploadResponse.failedItems.length > 0) {
      core.setFailed(
        `An error was encountered when uploading ${uploadResponse.artifactName}. There were ${uploadResponse.failedItems.length} items that failed to upload.`
      );
      return false;
    }

    core.info(
      `Artifact ${uploadResponse.artifactName} has been successfully uploaded!`
    );
    return true;
  },
};
