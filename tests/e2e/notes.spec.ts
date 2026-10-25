import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { openHome } from "./helpers";
const key = "interactive-au:notes:v2", legacyKey = "interactive-au:notes:v1";
async function openNotes(page: Page) {
  await page.getByRole("button", { name: "Open Notes", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Notes", exact: true })).toBeFocused();
  await expect(page.getByRole("button", { name: "Create note" })).toBeEnabled();
}
async function begin(page: Page) {
  await page.getByRole("button", { name: "Create note" }).click();
  await expect(page.getByRole("textbox", { name: "Note title" })).toBeFocused();
  await expect(page.getByTestId("virtual-keyboard")).toBeVisible();
}
async function stored(page: Page) { return page.evaluate((storageKey) => localStorage.getItem(storageKey), key); }

test("session Notes create, save, reopen, then reset to dated seeds on reload", async ({ page, isMobile }, info) => {
  await page.setViewportSize(isMobile ? { width: 393, height: 852 } : { width: 1366, height: 768 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/"); await openHome(page); await openNotes(page);
  await expect(page.getByRole("button", { name: "Open DemoApp" })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Yesterday", exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Previous 7 Days", exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Previous 30 Days", exact: true })).toBeVisible();
  await page.screenshot({ path: `artifacts/phase-5.3/list-groups-${info.project.name}.png`, fullPage: true });
  await page.getByRole("button",{name:"Create note"}).screenshot({path:`artifacts/phase-5.3/compose-closeup-${info.project.name}.png`});
  await expect(page.locator(".notes-compose svg")).toHaveCSS("filter","none");
  await begin(page);
  const title = page.getByRole("textbox", { name: "Note title" }), body = page.getByRole("textbox", { name: "Note body" });
  await title.fill("A quiet morning"); await title.press("Enter"); await expect(body).toBeFocused();
  await body.fill("A new fictional note.");
  expect(await title.evaluate((element) => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThan(await body.evaluate((element) => parseFloat(getComputedStyle(element).fontSize)));
  await expect(title).toHaveCSS("outline-style", "none"); await expect(body).toHaveCSS("outline-style", "none");
  await expect(page.getByRole("button", { name: "Done", exact: true })).toHaveCSS("color", "rgb(255, 255, 255)");
  await expect(page.locator(".notes-done svg")).toHaveCSS("filter", "none");
  await expect(page.locator(".notes-done svg path")).toHaveCount(1);
  await page.getByRole("button",{name:"Done",exact:true}).screenshot({path:`artifacts/phase-5.3/done-closeup-${info.project.name}.png`});
  await page.screenshot({ path: `artifacts/phase-5.3/editor-keyboard-${info.project.name}.png`, fullPage: true });
  const screen = page.getByTestId("device-screen");
  const rect = await screen.boundingBox();
  if (!rect) throw new Error("Missing Notes display");
  await page.screenshot({path:`artifacts/phase-5.3/editor-top-${info.project.name}.png`,clip:{x:rect.x,y:rect.y,width:rect.width,height:Math.min(200,rect.height)}});
  await page.locator(".notes-formatting").screenshot({ path: `artifacts/phase-5.3/toolbar-${info.project.name}.png` });
  await page.getByRole("button", { name: "Hide keyboard", exact: true }).click();
  await page.screenshot({ path: `artifacts/phase-5.3/editor-title-body-${info.project.name}.png`, fullPage: true });
  await page.getByRole("button", { name: "Done", exact: true }).click();
  const row = page.getByRole("button", { name: "Open note: A quiet morning", exact: true });
  await expect(row).toBeFocused(); await expect(row).toHaveCSS("outline-style", "none"); await expect(row).toHaveCSS("box-shadow", "none");
  const saved = await stored(page);
  await row.click(); await expect(title).toHaveValue("A quiet morning"); await expect(body).toHaveValue("A new fictional note.");
  await page.getByRole("button", { name: "Back to Notes", exact: true }).click(); expect(await stored(page)).toBe(saved);
  await page.screenshot({ path: `artifacts/phase-5.3/list-unchanged-${info.project.name}.png`, fullPage: true });
  await row.click(); await body.fill("Edited with a physical keyboard."); await body.press("End"); await page.keyboard.type(" More.");
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await page.screenshot({ path: `artifacts/phase-5.3/list-edited-${info.project.name}.png`, fullPage: true });
  await page.getByTestId("app-home-gesture").click(); await expect(page.getByRole("button", { name: "Open Notes", exact: true })).toBeFocused();
  await openNotes(page); await row.click(); await expect(body).toHaveValue("Edited with a physical keyboard. More.");
  await page.reload(); await openHome(page); await openNotes(page);
  await expect(page.getByText("3 Notes", { exact: true })).toBeVisible(); await expect(row).toHaveCount(0);
});

test("opening old notes writes nothing and keeps calendar labels/order", async ({ page }) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) { document.documentElement.dataset.notesWrites = String(Number(document.documentElement.dataset.notesWrites ?? 0) + 1); return original.call(this, key, value); };
  });
  await page.goto("/"); await openHome(page); await openNotes(page);
  const before = await page.locator(".notes-row").allTextContents();
  await page.getByRole("button", { name: "Open note: Colors to remember", exact: true }).click();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  expect(await page.locator(".notes-row").allTextContents()).toEqual(before);
  expect(await stored(page)).toBeNull();
  expect(await page.locator("html").getAttribute("data-notes-writes")).toBeNull();
  await page.getByRole("button", { name: "Open note: Colors to remember", exact: true }).click();
  await page.getByRole("textbox", { name: "Note body" }).fill("Actually changed.");
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await expect(page.locator(".notes-row").first()).toHaveAccessibleName("Open note: Colors to remember");
  await expect(page.locator(".notes-row").first().locator("time")).toHaveText("Today");
  const saved = await stored(page); await page.getByRole("button", { name: "Open note: Colors to remember", exact: true }).click();
  await page.getByRole("button", { name: "Done", exact: true }).focus(); await page.keyboard.press("Enter");
  expect(await stored(page)).toBe(saved); await expect(page.locator(".notes-row").first()).toHaveCSS("outline-style", "solid");
});

test("legacy dated and undated storage stays byte-for-byte intact and is not imported", async ({ page }, info) => {
  const v1 = JSON.stringify({ version: 1, notes: [{ id: "legacy", text: "A reader note", group: "Earlier" }] });
  const v2 = JSON.stringify({ version: 2, notes: [{ id: "old", text: "Another reader note", createdAt: null, updatedAt: null, editOrder: 1 }] });
  await page.addInitScript(({legacyKey,key,v1,v2}) => {
    if (!localStorage.getItem(legacyKey)) localStorage.setItem(legacyKey,v1);
    if (!localStorage.getItem(key)) localStorage.setItem(key,v2);
  }, {legacyKey,key,v1,v2});
  await page.goto("/"); await openHome(page); await openNotes(page);
  await expect(page.getByRole("region", {name:"Date unavailable"})).toHaveCount(0);
  await expect(page.getByRole("button",{name:"Open note: A reader note",exact:true})).toHaveCount(0);
  await expect(page.getByText("3 Notes",{exact:true})).toBeVisible();
  await page.screenshot({path:`artifacts/phase-5.3/legacy-notes-${info.project.name}.png`,fullPage:true});
  await begin(page); await page.getByRole("textbox",{name:"Note title"}).fill("Temporary change"); await page.getByRole("button",{name:"Done",exact:true}).click();
  expect(await stored(page)).toBe(v2); expect(await page.evaluate((key)=>localStorage.getItem(key),legacyKey)).toBe(v1);
  await page.reload(); await openHome(page); await openNotes(page);
  await expect(page.getByRole("button",{name:"Open note: Temporary change",exact:true})).toHaveCount(0);
  expect(await stored(page)).toBe(v2); expect(await page.evaluate((key)=>localStorage.getItem(key),legacyKey)).toBe(v1);
});

test("virtual keyboard owns the active field, selection, shift, and native fallback", async ({ page, isMobile }) => {
  await page.goto("/"); await openHome(page); await openNotes(page); await begin(page);
  const title = page.getByRole("textbox", { name: "Note title" }), body = page.getByRole("textbox", { name: "Note body" });
  const press = async (name: string) => { const button = page.getByRole("button", { name, exact: true }); if (isMobile) await button.tap(); else await button.click(); };
  await press("Type H"); await press("Type i"); await press("Return"); await expect(body).toBeFocused();
  await press("Type a"); await press("Space"); await press("Type b"); await expect(body).toHaveValue("a b");
  await body.fill("abcd"); await body.evaluate((element: HTMLTextAreaElement) => element.setSelectionRange(2,2));
  await press("Type x"); await expect(body).toHaveValue("abxcd");
  await body.evaluate((element: HTMLTextAreaElement) => element.setSelectionRange(1,4)); await press("Type z"); await expect(body).toHaveValue("azd");
  await press("Backspace"); await expect(body).toHaveValue("ad");
  await press("Numbers and symbols"); await press("Type 1"); await press("More symbols"); await press("Type #");
  await press("Alphabetic keyboard"); await press("Shift"); await press("Shift"); await press("Type A"); await press("Type B");
  await expect(body).toHaveValue("a1#ABd");
  await body.fill(""); await body.press("Backspace"); await expect(title).toBeFocused();
  await title.press("Enter"); await expect(body).toBeFocused(); await page.keyboard.type("Physical text");
  await press("Hide keyboard"); await expect(page.getByTestId("virtual-keyboard")).toHaveCount(0);
  await page.getByRole("button", { name: "Show simulated keyboard", exact: true }).click();
  await page.getByRole("button", { name: "Switch to native keyboard" }).click();
  await expect(body).toHaveAttribute("inputmode", "text"); await expect(page.getByTestId("virtual-keyboard")).toHaveCount(0);
  await page.getByRole("button", { name: "Show simulated keyboard", exact: true }).click();
  await page.getByRole("button", { name: "Use native text entry" }).click();
  await expect(body).toHaveAttribute("inputmode", "text"); await expect(body).toBeEditable();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await page.getByRole("button", { name: "Open note: Hi", exact: true }).click(); await expect(body).toHaveValue("Physical text");
});

test("virtual-only note saves within a page session and empty drafts add no records", async ({ page }) => {
  await page.goto("/"); await openHome(page); await openNotes(page); await begin(page);
  await page.getByRole("button", { name: "Done", exact: true }).click(); await expect(page.getByText("3 Notes", { exact: true })).toBeVisible(); await begin(page);
  for (const name of ["Type H", "Type i", "Return", "Type a", "Space", "Type b"]) await page.getByRole("button", { name, exact: true }).click();
  await page.getByRole("button", { name: "Done", exact: true }).click(); await page.getByRole("button", { name: "Open note: Hi", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Note title" })).toHaveValue("Hi"); await expect(page.getByRole("textbox", { name: "Note body" })).toHaveValue("a b");
});

test("obsolete corrupt storage is ignored and remains intact", async ({ page }) => {
  await page.addInitScript((storageKey) => localStorage.setItem(storageKey, "{broken"), key);
  await page.goto("/"); await openHome(page); await openNotes(page); await expect(page.getByRole("status")).toHaveCount(0); await begin(page);
  await page.getByRole("textbox", { name: "Note title" }).fill("Memory only"); await page.getByRole("button", { name: "Done", exact: true }).click();
  expect(await stored(page)).toBe("{broken"); await expect(page.getByRole("button", { name: "Open note: Memory only", exact: true })).toBeVisible();
});
for (const failure of ["read", "write"]) test(`storage ${failure} failure preserves editing`, async ({ page }) => {
  await page.addInitScript((kind) => { if (kind === "read") Object.defineProperty(window,"localStorage",{get(){throw new Error("blocked");}}); else Object.defineProperty(Storage.prototype,"setItem",{value(){throw new Error("quota");}}); }, failure);
  await page.goto("/"); await openHome(page); await openNotes(page); await begin(page);
  await page.getByRole("textbox", { name: "Note title" }).fill("In memory"); await page.getByRole("button", { name: "Done", exact: true }).click(); await expect(page.getByRole("status")).toHaveCount(0);
});

test("light Notes remains accessible in list, editor, and keyboard modes", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" }); await page.goto("/"); await openHome(page); await openNotes(page);
  await expect(page.locator(".os-status-bar")).toHaveCSS("color", "rgb(23, 23, 23)");
  const canvas = await page.getByTestId("os-app").evaluate((element)=>getComputedStyle(element).backgroundColor);
  await expect(page.getByTestId("notes-app")).toHaveCSS("background-color",canvas);
  await expect(page.locator(".notes-navigation")).toHaveCSS("background-color",canvas);
  expect((await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze()).violations).toEqual([]);
  await begin(page);
  await expect(page.getByTestId("notes-app")).toHaveCSS("background-color",canvas);
  await expect(page.locator(".notes-writing")).toHaveCSS("background-color",canvas);
  expect((await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze()).violations).toEqual([]);
});

test("responsive Notes fields, toolbar and keyboard fit glass", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop-chromium", "Run layout matrix once."); test.setTimeout(60_000);
  for (const viewport of [{width:320,height:568},{width:375,height:667},{width:393,height:852},{width:430,height:932},{width:768,height:1024},{width:1366,height:768},{width:852,height:393}]) {
    await page.setViewportSize(viewport); await page.emulateMedia({reducedMotion:"reduce"}); await page.goto("/"); await openHome(page); await openNotes(page);
    await page.screenshot({path:`artifacts/phase-5.3/list-${viewport.width}x${viewport.height}.png`,fullPage:true});
    await begin(page); await page.getByRole("textbox",{name:"Note title"}).fill("A title that can wrap naturally");
    await page.getByRole("textbox",{name:"Note body"}).fill("A body line.\n".repeat(20));
    await page.screenshot({path:`artifacts/phase-5.3/keyboard-${viewport.width}x${viewport.height}.png`,fullPage:true});
    const glass=await page.getByTestId("device-screen").boundingBox(), keyboard=await page.getByTestId("virtual-keyboard").boundingBox(), home=await page.getByTestId("app-home-gesture").boundingBox();
    if(!glass||!keyboard||!home)throw new Error("Missing geometry");
    expect(keyboard.x).toBeGreaterThanOrEqual(glass.x); expect(keyboard.x+keyboard.width).toBeLessThanOrEqual(glass.x+glass.width+1); expect(keyboard.y+keyboard.height).toBeLessThanOrEqual(home.y+1);
    const topKey = await page.locator(".keyboard-row-0 .keyboard-key").first().boundingBox();
    const middleKey = await page.locator(".keyboard-row-1 .keyboard-key").first().boundingBox();
    const space = await page.getByRole("button",{name:"Space",exact:true}).boundingBox();
    const numbers = await page.getByRole("button",{name:"Numbers and symbols",exact:true}).boundingBox();
    if(!topKey||!middleKey||!space||!numbers)throw new Error("Missing key geometry");
    expect(topKey.height).toBeLessThanOrEqual(36.5); expect(topKey.width/topKey.height).toBeGreaterThan(.65);
    expect(middleKey.x).toBeGreaterThan(topKey.x); expect(space.width).toBeGreaterThan(numbers.width*3);
    await expect(page.getByRole("button",{name:"Switch to native keyboard"})).toBeEnabled();
    expect(await page.locator(".notes-formatting").evaluate((element)=>element.scrollWidth<=element.clientWidth)).toBe(true);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.getByRole("button",{name:"Done",exact:true}).click();
  }
  await page.setViewportSize({width:393,height:500}); await page.goto("/"); await openHome(page); await openNotes(page); await begin(page);
  await page.addStyleTag({content:"html {font-size:150%}"}); await page.getByRole("button",{name:"Hide keyboard",exact:true}).click();
  await page.getByRole("button",{name:"Use native text entry"}).click(); await page.getByRole("textbox",{name:"Note title"}).fill("Resized viewport");
  await page.getByRole("button",{name:"Done",exact:true}).click(); await expect(page.getByRole("button",{name:"Open note: Resized viewport",exact:true})).toBeFocused();
});
