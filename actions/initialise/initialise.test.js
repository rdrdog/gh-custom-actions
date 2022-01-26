const artifact = require('@actions/artifact');
const core = require('@actions/core');
const git = require('./git');
const fs = require('fs');

jest.mock('@actions/artifact');
jest.mock('@actions/core');
jest.mock('./git');

jest.mock('fs', () => {
  const originalModule = jest.requireActual('fs');

  //Mock the default export and named export 'foo'
  return {
    __esModule: true,
    ...originalModule,
    promises: {
      writeFile: jest.fn(),
      readFile: jest.fn(),
    }
  };
});

const { runAsync } = require('./initialise');
const { expect } = require('@jest/globals');

describe('initialise', () => {
  const gitState = { branchName: 'main' };
  const mockArtifactClient = {
    uploadArtifact: jest.fn()
  };

  beforeEach(() => {
    jest.resetAllMocks();
    git.generateGitStateAsync.mockResolvedValue(gitState);
    artifact.create.mockReturnValue(mockArtifactClient);
  })

  it('fetches the git state', async () => {
    await runAsync();
    expect(git.generateGitStateAsync).toHaveBeenCalledTimes(1);
  });

  it('writes the git state to file', async () => {
    await runAsync();

    expect(fs.promises.writeFile).toHaveBeenCalledTimes(1);
    expect(fs.promises.writeFile.mock.calls[0][0]).toBe('manifest_git_state');
    const writtenState = JSON.parse(fs.promises.writeFile.mock.calls[0][1]);
    expect(writtenState).toStrictEqual(gitState);
  });

  it('publishes the git state as an artifact', async () => {
    await runAsync();

    expect(mockArtifactClient.uploadArtifact).toHaveBeenCalledTimes(1);
    expect(mockArtifactClient.uploadArtifact).toHaveBeenCalledWith(
      'manifest_git_state',
      ['manifest_git_state'],
      './',
      {
        continueOnError: false,
        retentionDays: 1
      }
    );
  });

  it('fails when the upload fails', async () => {
    mockArtifactClient.uploadArtifact.mockResolvedValue({
      failedItems: ['something']
    });
    await runAsync();

    expect(core.setFailed).toHaveBeenCalledTimes(1);
  });

});
