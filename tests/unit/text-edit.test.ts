import { describe, expect, it } from "vitest";
import { editText } from "../../src/components/virtual-keyboard/text-edit";

describe("textarea-backed virtual keyboard edits", () => {
  it("inserts at the caret instead of blindly appending", () => {
    expect(editText("abcd", 2, 2, { type: "insert", text: "X" })).toEqual({ text: "abXcd", caret: 3 });
  });
  it("replaces selection and inserts spaces and multiline returns", () => {
    expect(editText("abcd", 1, 3, { type: "insert", text: " \n" })).toEqual({ text: "a \nd", caret: 3 });
  });
  it("deletes selected text and whole previous Unicode graphemes", () => {
    expect(editText("abcd", 1, 3, { type: "backspace" })).toEqual({ text: "ad", caret: 1 });
    const emoji = "\u{1F469}\u200d\u{1F3A8}";
    expect(editText("a" + emoji, 1 + emoji.length, 1 + emoji.length, { type: "backspace" })).toEqual({ text: "a", caret: 1 });
    expect(editText("", 0, 0, { type: "backspace" })).toEqual({ text: "", caret: 0 });
  });
  it("bounds selection offsets and rejects oversized insertion", () => {
    expect(editText("a", 99, 99, { type: "insert", text: "b" }).text).toBe("ab");
    expect(editText("x".repeat(100_000), 100_000, 100_000, { type: "insert", text: "b" }).text).toHaveLength(100_000);
  });
});
