module.exports = {
  buildArgContainerCommitSha: "COMMIT_SHA",
  buildArgContainerBuildNumber: "BUILD_NUMBER",

  isCI: () => process.env.ACT !== "true",
};
