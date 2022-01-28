module.exports = {
  buildArgContainerCommitSha: "COMMIT_SHA",
  buildArgContainerBuildNumber: "BUILD_NUMBER",

  inputDockerfile: "dockerfile",
  inputContext: "context",
  inputIncludes: "includes",

  isCI: () => process.env.ACT !== "true",
};
