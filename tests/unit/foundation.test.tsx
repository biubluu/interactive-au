import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import Page from "../../src/app/page";
import nextConfig from "../../next.config";

afterEach(() => vi.restoreAllMocks());

describe("static foundation", () => {
  it("server-renders fixed story clock without reading the device time", () => {
    vi.spyOn(Date, "now").mockImplementation(() => { throw new Error("No device clock during SSR"); });
    const html = renderToStaticMarkup(<Page />);
    expect(html).toContain('data-testid="os-lock"');
    expect(html).toContain("11.11");
    expect(html).toContain("Tue 17 Nov");
    expect(html).toContain('dateTime="2026-11-17T11:11:00+07:00"');
    expect(html).not.toContain("--:--");
    expect(html).toContain("Enter passcode");
    expect(html).not.toContain("PLACEHOLDER");
    expect(html).not.toContain("Enter Experience");
    expect(renderToStaticMarkup(<Page />)).toBe(html);
  });

  it("keeps static export and hides only the dev indicator", () => {
    expect(nextConfig.output).toBe("export");
    expect(nextConfig.trailingSlash).toBe(true);
    expect(nextConfig.devIndicators).toBe(false);
  });
});
