import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import LandingPage from "../../src/app/page";
import nextConfig from "../../next.config";

describe("static foundation", () => {
  it("renders the landing page without browser APIs or a client store", () => {
    const html = renderToStaticMarkup(<LandingPage />);

    expect(html).toContain("<main");
    expect(html).toContain("PLACEHOLDER");
    expect(html).toContain('href="#experience-placeholder"');
    expect(html).toContain('id="experience-placeholder"');
    expect(html).toContain("Enter Experience");
  });

  it("keeps production output compatible with static hosting", () => {
    expect(nextConfig.output).toBe("export");
  });
});
