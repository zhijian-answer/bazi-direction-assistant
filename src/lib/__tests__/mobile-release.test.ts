import { describe, expect, it } from "vitest";
import manifest from "../../app/manifest";
import { releaseFeatures, releasedToolIds } from "../mobile/releaseFeatures";

describe("mobile release surface", () => {
  it("exposes only tools that have working product flows", () => {
    expect([...releasedToolIds]).toEqual(["compat", "natal", "qa"]);
    expect(releaseFeatures.compatibility).toBe(true);
    expect(releaseFeatures.natalChart).toBe(true);
    expect(releaseFeatures.mobileChat).toBe(true);
    expect(releaseFeatures.combinedInsight).toBe(false);
    expect(releaseFeatures.personalityTest).toBe(false);
  });

  it("starts the installed app in the mobile client", () => {
    const appManifest = manifest();
    expect(appManifest.id).toBe("/m");
    expect(appManifest.start_url).toBe("/m");
    expect(appManifest.scope).toBe("/m");
    expect(appManifest.display).toBe("standalone");
  });
});
