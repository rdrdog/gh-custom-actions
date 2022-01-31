const core = require("@actions/core");
const manifest = require("@eroad/gh-common/manifest");
const docker = require("@eroad/gh-common/docker");

jest.mock("@actions/core");
jest.mock("@eroad/gh-common/manifest");
jest.mock("@eroad/gh-common/docker");

const { run } = require("./run");
const { expect } = require("@jest/globals");

describe("docker run", () => {
    const imageNames = "infra";
    const fqImageNameAndTag = "example/infra:4877f50-1643663799378";
    const imageName = "infra";

    beforeEach(() => {
        jest.resetAllMocks();
        core.getInput.mockReturnValue(imageNames);
        manifest.getImageNameAndTagAsync.mockResolvedValue(fqImageNameAndTag);
        //docker.runAsync.mockResolvedValue(1);
    });

    it("runs the docker container", async () => {
        await run();
        expect(manifest.getImageNameAndTagAsync).toHaveBeenCalledTimes(1);
        expect(manifest.getImageNameAndTagAsync).toHaveBeenCalledWith(
            "infra"
        );
        manifest.getImageNameAndTagAsync(imageName).then(data => {
            expect(data).toBe(fqImageNameAndTag)
        })
    });
});
