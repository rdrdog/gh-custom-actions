const core = require("@actions/core");
const fs = require("fs");
const artifactHandler = require("./artifact-handler");

const manifestImagesKey = "manifest_images";

// Gets the fully qualidifed image name and tag for the specified image name (key)
// e.g. given: "api", result: "ecr.example.org/example/api:abc123de"
const getImageNameAndTagAsync = async (imageName) => {

  // We only need to download the manifest once:
  if (!getImageNameAndTagAsync._hasDownloaded) {
    await artifactHandler.downloadArtifactAsync(manifestImagesKey);
    getImageNameAndTagAsync._hasDownloaded = true;
  }

  return await fs.promises.readFile(
    imageName,
    { encoding: "utf8" }
  );
}

const storeImageNameAndTagAsync = async (imageName, fqImageName, imageTag) => {
  await fs.promises.writeFile(imageName, `${fqImageName}:${imageTag}`);

  await artifactHandler.uploadArtifactAsync(manifestImagesKey, imageName);
}


module.exports = {
  getImageNameAndTagAsync,
  storeImageNameAndTagAsync,
};
