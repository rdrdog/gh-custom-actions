const core = require('@actions/core');
const exec = require('@actions/exec');

const buildKitEnabled = true;

const _executeDockerProcessAsync = async (args, options, strErrToStdOut = false) => {
};

// const loginAsync = async (containerRegistry) => {
//   if (configLoader.config.requiresDockerLogin) {
//     const { username, password } = await secretsProvider.getCredentialsAsync('docker');

//     const loginArgs = `login --username ${username} --password-stdin ${containerRegistry}`.split(' ');
//     core.info(`Logging into docker ${loginArgs}`);

//     await exec.exec('docker', loginArgs, { input: password });
//     core.info('Docker login successful');
//   } else {
//     core.info('Skipping docker login');
//   }
// };

const pullAsync = async (imageNameAndTag, ignorePullFailure = true) => {
  core.info(`Attempting pull of image ${imageNameAndTag}`);
  const exitCode = await exec.exec('docker', ['pull', '--quiet', imageNameAndTag]);
  if (exitCode == 0) {
    return;
  }

  if (ignorePullFailure) {
    core.info(`Container ${imageNameAndTag} was not available to be pulled.`);
    return;
  }

  core.info(`Could not pull image (${imageNameAndTag}). Error: ${err}`);
  throw Error(`docker pull ${imageNameAndTag} failed`);
};

const getBuildArgsAsync = async (dockerfilePath,
  context,
  imageName,
  imageTag,
  additionalBuildArgs = []
) => {

  // Build our container
  const buildArgs = [
    'build',
    '-t', `${imageName}:latest`,
    '-t', `${imageName}:${imageTag}`,
    '--cache-from', `${imageName}:latest`,
  ];

  for (const arg of additionalBuildArgs) {
    buildArgs.push('--build-arg', arg);
  }

  if (buildKitEnabled) {
    core.info('⚡ buildkit enabled ⚡');
    buildArgs.push(
      '--build-arg', 'BUILDKIT_INLINE_CACHE=1',
    );
  }

  buildArgs.push('-f', dockerfilePath, context);

  return buildArgs;
};

const buildAsync = async (dockerfilePath,
  contextPath,
  fqImageName,
  imageTag,
  additionalBuildArgs = []
) => {
  // Enable docker buildkit
  process.env.DOCKER_BUILDKIT = buildKitEnabled ? 1 : 0;

  const buildArgs = await getBuildArgsAsync(dockerfilePath, contextPath, fqImageName, imageTag, additionalBuildArgs);
	core.debug(`🐳 docker ${buildArgs.join(' ')}`);

  const output = await exec.getExecOutput('docker', buildArgs)
  if (output.exitCode != 0) {
    core.setFailed(`Failed to build docker image ${fqImageName} (dockerFile: ${dockerfilePath})`);
  }
};

const runAsync = async (container, envVars) => {
  core.info(`Running docker container ${container}`);

  let environmentArgs = '';
  for (const key of Object.keys(envVars || {})) {
    environmentArgs += `-e ${key}=${envVars[key]} `;
    core.info(`Adding environment var: ${key}`);
  }
  const runArgs = `run --rm ${environmentArgs}${container}`;
  await _executeDockerProcessAsync(runArgs.split(' '));
};

const pushAsync = async (imageNameAndTag) => {
  core.info(`Pushing image ${imageNameAndTag}`);
  await _executeDockerProcessAsync(['push', imageNameAndTag]);
};

// const getLatestImageWithSuffixLocalAsync = async (containerName, tagSuffix) => {
//   core.info(`Getting latest image of ${containerName} with tag suffix '${tagSuffix}'`);
//   const args = `images ls --filter reference=${containerName}*${tagSuffix} --format {{.Repository}}:{{.Tag}}`.split(' ');
//   try {
//     const stdout = await _executeDockerProcessAsync(args);
//     const latestImage = stdout.split('\n')[0];
//     return latestImage;
//   } catch (err) {
//     core.warn(`Unable to get latest image of docker container ${containerName}`);
//     return '';
//   }
// };


module.exports = {
//  loginAsync,
  pullAsync,
  getBuildArgsAsync,
  buildAsync,
  runAsync,
  pushAsync,
  //getLatestImageWithSuffixLocalAsync,
};
