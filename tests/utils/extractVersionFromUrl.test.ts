import utils from "utils";

describe("Utility function extractVersionFromUrl", () => {
  it("Should return an empty string if version not found", () => {
    const url = "http://localhost/whatever";
    const version = utils.extractVersionFromUrl(url);
    expect(version).toBe("");
  });

  it("Should return an empty string if version not found - 2", () => {
    const url = "http://localhost/somev/15/";
    const version = utils.extractVersionFromUrl(url);
    expect(version).toBe("");
  });

  it("Should return an empty string if version is semantic with dots", () => {
    const url = "http://localhost/v3.5.3/";
    const version = utils.extractVersionFromUrl(url);
    expect(version).toBe("");
  });

  it("Should return a version if the url is correct", () => {
    const url = "http://localhost/v1/events/15/categories";
    const version = utils.extractVersionFromUrl(url);
    expect(version).toBe("v1");
  });

  it("Should return a version correctly if domain contains similar string", () => {
    const url = "http://somedomainnamev15/v1/events/15/categories";
    const version = utils.extractVersionFromUrl(url);
    expect(version).toBe("v1");
  });

  it("Should return a version if the url is correct - 2", () => {
    const url = "http://192.168.0.1/v1/events/15/categories";
    const version = utils.extractVersionFromUrl(url);
    expect(version).toBe("v1");
  });

  it("Should return a version if the url is correct - 3", () => {
    const url = "http://192.168.0.1/v129/events/15/categories";
    const version = utils.extractVersionFromUrl(url);
    expect(version).toBe("v129");
  });

  it("Should return a version if the url is correct - 4", () => {
    const url = "/v2/events";
    const version = utils.extractVersionFromUrl(url);
    expect(version).toBe("v2");
  });
});
