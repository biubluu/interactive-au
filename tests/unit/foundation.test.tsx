import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import LandingPage from "../../src/app/page";
import nextConfig from "../../next.config";

describe("static foundation", () => {
  it("server-renders a deterministic locked experience without browser APIs", () => {
    const html = renderToStaticMarkup(<LandingPage />);

    expect(html).toContain("<main");
    expect(html).toContain("PLACEHOLDER");
    expect(html).toContain('data-testid="os-lock"');
    expect(html).toContain("9:41");
    expect(html).toContain("Sunday, October 25");
    expect(html).toContain("Unlock");
    expect(html).not.toContain("Enter Experience");
    expect(renderToStaticMarkup(<LandingPage />)).toBe(html);
  });

  it("keeps production output compatible with static hosting", () => {
    expect(nextConfig.output).toBe("export");
  });
});
