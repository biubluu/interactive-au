export type TextEdit = { type: "insert"; text: string } | { type: "backspace" };
/** UTF-16 selection positions match native textarea; deletion respects graphemes. */
export function editText(value: string, selectionStart: number, selectionEnd: number, edit: TextEdit) {
  let start = Math.max(0, Math.min(selectionStart, value.length));
  const end = Math.max(start, Math.min(selectionEnd, value.length));
  if (edit.type === "backspace" && start === end && start > 0) {
    const segments = Array.from(new Intl.Segmenter("en", { granularity: "grapheme" }).segment(value.slice(0, start)));
    start = segments.at(-1)?.index ?? 0;
  }
  const inserted = edit.type === "insert" ? edit.text : "";
  const text = value.slice(0, start) + inserted + value.slice(end);
  return text.length <= 100_000 ? { text, caret: start + inserted.length } : { text: value, caret: end };
}

/** Reveal a programmatically edited caret using the textarea's actual wrapping. */
export function revealCaret(target: HTMLTextAreaElement, caret: number) {
  const style = getComputedStyle(target);
  const mirror = document.createElement("div");
  mirror.style.cssText = "position:fixed;top:0;left:0;visibility:hidden;pointer-events:none;white-space:pre-wrap;overflow-wrap:break-word;box-sizing:border-box";
  Object.assign(mirror.style, { width: `${target.clientWidth}px`, font: style.font, lineHeight: style.lineHeight, letterSpacing: style.letterSpacing, padding: style.padding });
  mirror.textContent = target.value.slice(0, caret);
  const marker = document.createElement("span");
  marker.textContent = "\u200b";
  mirror.append(marker);
  document.body.append(mirror);
  const top = marker.getBoundingClientRect().top - mirror.getBoundingClientRect().top;
  const line = parseFloat(style.lineHeight) || 24;
  if (top < target.scrollTop) target.scrollTop = top;
  else if (top + line > target.scrollTop + target.clientHeight) target.scrollTop = top + line - target.clientHeight;
  mirror.remove();
}
