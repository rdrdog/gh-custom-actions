const artifact = require('@actions/artifact');
const core = require('@actions/core');
const github = require('@actions/github');
const exec = require('@actions/exec');
const fs = require('fs');


const manifestGitStateKey = "manifest_git_state";
const loadGitState = async () => {
  const artifactClient = artifact.create();

  const downloadOptions = {
    createArtifactFolder: false
  };

  const downloadResponse = await artifactClient.downloadArtifact(
    manifestGitStateKey,
    '',
    downloadOptions
  );

  core.info(`Artifact ${downloadResponse.artifactName} was downloaded to ${downloadResponse.downloadPath}`);

}

const run = async () => {
  try {

    await loadGitState();
    const fileContents = await fs.promises.readFile(manifestGitStateKey, { encoding: 'utf8' });
    core.info('read git state contents: ' + fileContents);

    /*Do this:

    # set the container registry to have a trailing slash, unless it is empty
  #       registry="${{ inputs.registry }}"
  #       if [[ "$registry" != "" && "$registry" != * / ]]; then
  #         registry="$registry/"
  #       fi
  #       if [[ "$ACT" == "true" ]]; then
  #         # no registry for local builds
  #         registry=""
  #       fi

  #       fqImageName=${registry}${STACK_NAME}/${{ inputs.image_name }}

  #       # Define image tag
  #       imageTag=${GIT_COMMIT_SHA:0:7}
  #       if [[ "$ACT" == "true" ]]; then
  #         # add date time to image tag for local builds
  #         imageTag="$imageTag-$(date +"%y%m%d%H%M%S")"
  #       fi

  #       echo "::set-output name=FQ_IMAGE_NAME::$fqImageName"
  #       echo "::set-output name=IMAGE_TAG::$imageTag"

  */


    // `who-to-greet` input defined in action metadata file
    const nameToGreet = core.getInput('who-to-greet');
    console.log(`Hello ${nameToGreet}!`);
    const time = (new Date()).toTimeString();
    core.setOutput("time", time);
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
