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
    });

    it("runs a docker container", async () => {
        await run();
        expect(manifest.getImageNameAndTagAsync).toHaveBeenCalledTimes(1);
        expect(manifest.getImageNameAndTagAsync).toHaveBeenCalledWith(imageName);
        expect(docker.runAsync).toHaveBeenCalledTimes(1);
        expect(docker.runAsync).toHaveBeenCalledWith(fqImageNameAndTag);
    });
    it("runs multiple docker containers", async () => {
        const multipleImages = "infra,api,  backend"
        const arrMultipleImages = multipleImages.split(",")
        core.getInput.mockReturnValue(multipleImages);
        await run();
        expect(manifest.getImageNameAndTagAsync).toHaveBeenCalledTimes(3);
        expect(manifest.getImageNameAndTagAsync).toHaveBeenCalledWith(arrMultipleImages[0].trim());
        expect(manifest.getImageNameAndTagAsync).toHaveBeenCalledWith(arrMultipleImages[1].trim());
        expect(manifest.getImageNameAndTagAsync).toHaveBeenCalledWith(arrMultipleImages[2].trim());
    });
});
