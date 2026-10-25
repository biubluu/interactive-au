"use client";

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { useIsPresent } from "motion/react";
import type { VirtualAppProps } from "../virtual-app";
import { VirtualKeyboard } from "../../../components/virtual-keyboard/virtual-keyboard";
import { editText, revealCaret, type TextEdit } from "../../../components/virtual-keyboard/text-edit";
import { useNotes } from "./use-notes";
import { newNoteId, noteSummary, splitNote, joinNote } from "./notes-model";
import { noteDate } from "./notes-calendar";
import { NotesIcon } from "./notes-icons";
import "./notes.css";

type NotesView = { kind: "list" } | { kind: "editor"; id: string; parts: ReturnType<typeof splitNote> };
export function NotesApp({ onHome }: VirtualAppProps) {
  const { notes, save } = useNotes();
  const [view, setView] = useState<NotesView>({ kind: "list" });
  const [keyboard, setKeyboard] = useState(false);
  const [nativeEntry, setNativeEntry] = useState(false);
  const isPresent = useIsPresent();
  const root = useRef<HTMLElement>(null);
  const titleField = useRef<HTMLTextAreaElement>(null);
  const bodyField = useRef<HTMLTextAreaElement>(null);
  const activeField = useRef<"title" | "body">("title");
  const [focusMode, setFocusMode] = useState<"pointer" | "keyboard">("keyboard");
  const heading = useRef<HTMLHeadingElement>(null);
  const done = useRef<HTMLButtonElement>(null);
  const compose = useRef<HTMLButtonElement>(null);
  const focusNote = useRef<string | null>(null);
  const caret = useRef<{ field: "title" | "body"; position: number } | null>(null);

  useLayoutEffect(() => {
    if (!isPresent) return;
    if (view.kind === "editor") {
      const title = titleField.current;
      if (title) { title.style.height = "auto"; title.style.height = `${title.scrollHeight}px`; }
      if (caret.current !== null) {
        const target = caret.current.field === "title" ? titleField.current : bodyField.current;
        activeField.current = caret.current.field;
        target?.focus({ preventScroll: true });
        target?.setSelectionRange(caret.current.position, caret.current.position);
        if (target) revealCaret(target, caret.current.position);
        caret.current = null;
      }
    } else {
      const row = Array.from(root.current?.querySelectorAll<HTMLButtonElement>("[data-note-id]") ?? []).find((button) => button.dataset.noteId === focusNote.current);
      if (focusNote.current !== null) (row ?? compose.current)?.focus();
      else heading.current?.focus();
    }
  }, [view, isPresent]);

  useLayoutEffect(() => {
    if (nativeEntry && isPresent) { const target = activeField.current === "title" ? titleField.current : bodyField.current; target?.blur(); target?.focus({ preventScroll: true }); }
  }, [nativeEntry, isPresent]);

  useEffect(() => {
    const viewport = window.visualViewport;
    function resize() {
      const element = root.current;
      const parent = element?.parentElement?.getBoundingClientRect();
      if (!element || !parent) return;
      const bottom = viewport ? viewport.height + viewport.offsetTop : window.innerHeight;
      element.style.setProperty("--notes-viewport-loss", `${Math.max(0, parent.bottom - bottom)}px`);
    }
    resize();
    viewport?.addEventListener("resize", resize);
    viewport?.addEventListener("scroll", resize);
    window.addEventListener("resize", resize);
    return () => { viewport?.removeEventListener("resize", resize); viewport?.removeEventListener("scroll", resize); window.removeEventListener("resize", resize); };
  }, []);

  function open(id: string, text: string) {
    activeField.current = "title";
    caret.current = { field: "title", position: 0 };
    setNativeEntry(false);
    setKeyboard(true);
    setView({ kind: "editor", id, parts: splitNote(text) });
  }
  function finish() {
    if (view.kind !== "editor") return;
    save(view.id, joinNote(view.parts));
    focusNote.current = view.id;
    setKeyboard(false);
    setView({ kind: "list" });
  }
  function updateField(field: "title" | "body", value: string) {
    if (view.kind !== "editor") return;
    const parts = { ...view.parts, [field]: value };
    if (field === "title" && /[\r\n]/.test(value)) {
      const [first, ...rest] = value.replace(/\r\n/g, "\n").split("\n");
      parts.title = first;
      parts.body = rest.join("\n") + (parts.body ? "\n" + parts.body : "");
      parts.separator = "\n";
      caret.current = { field: "body", position: rest.join("\n").length };
    }
    if (field === "body" && value && !parts.separator) parts.separator = "\n";
    if (joinNote(parts).length <= 100_000) setView({ ...view, parts });
  }
  function titleReturn() {
    if (view.kind !== "editor" || !titleField.current) return;
    const target = titleField.current;
    const tail = view.parts.title.slice(target.selectionEnd);
    const body = tail + (view.parts.body && tail ? "\n" : "") + view.parts.body;
    caret.current = { field: "body", position: 0 };
    setView({ ...view, parts: { ...view.parts, title: view.parts.title.slice(0, target.selectionStart), body, separator: "\n" } });
  }
  function emptyBodyBack() {
    if (view.kind !== "editor") return;
    caret.current = { field: "title", position: view.parts.title.length };
    setView({ ...view, parts: { ...view.parts, separator: "" } });
  }
  function physicalKey(event: KeyboardEvent<HTMLTextAreaElement>, field: "title" | "body") {
    if (event.nativeEvent.isComposing || view.kind !== "editor") return;
    if (field === "title" && event.key === "Enter") { event.preventDefault(); titleReturn(); }
    if (field === "body" && event.key === "Backspace" && !view.parts.body && event.currentTarget.selectionStart === 0) { event.preventDefault(); emptyBodyBack(); }
  }
  function insert(edit: TextEdit) {
    if (view.kind !== "editor") return;
    const field = activeField.current;
    const target = field === "title" ? titleField.current : bodyField.current;
    if (!target) return;
    if (field === "title" && edit.type === "insert" && edit.text === "\n") { titleReturn(); return; }
    if (field === "body" && edit.type === "backspace" && !view.parts.body && target.selectionStart === 0) { emptyBodyBack(); return; }
    const result = editText(view.parts[field], target.selectionStart, target.selectionEnd, edit);
    caret.current = { field, position: result.caret };
    updateField(field, result.text);
  }
  function hideKeyboard() { setKeyboard(false); done.current?.focus(); }

  return <section ref={root} className={`notes-app notes-${view.kind}`} data-testid="notes-app" data-view={view.kind} data-focus-mode={focusMode}
    onPointerDownCapture={() => setFocusMode("pointer")}
    onKeyDownCapture={(event) => { if (event.key === "Tab" || (event.target instanceof HTMLButtonElement && ["Enter", " "].includes(event.key))) setFocusMode("keyboard"); }}>
    <nav className="notes-navigation" aria-label="Notes navigation">
      <button className="notes-circle" aria-label={view.kind === "list" ? "Close Notes" : "Back to Notes"} onClick={view.kind === "list" ? onHome : finish}><NotesIcon name="back" /></button>
      <div className="notes-navigation-right">
        {view.kind === "editor" && <button className="notes-circle" disabled aria-label="Share note (unavailable)"><NotesIcon name="share" /></button>}
        <button className="notes-circle" disabled aria-label="More options (unavailable)"><NotesIcon name="more" /></button>
        {view.kind === "editor" && <button ref={done} className="notes-circle notes-done" aria-label="Done" onClick={finish}><NotesIcon name="check" /></button>}
      </div>
    </nav>
    {view.kind === "list" ? <>
      <div className="notes-list-content">
        <header className="notes-list-heading"><h1 className="os-scene-heading" tabIndex={-1} ref={heading}>Notes</h1>
          <p>{`${notes.length} ${notes.length === 1 ? "Note" : "Notes"}`}</p></header>
        {notes.length === 0 && <p className="notes-empty">No Notes</p>}
        {Array.from(new Set(notes.map((note) => noteDate(note.updatedAt).group))).map((group) => {
          const entries = notes.filter((note) => noteDate(note.updatedAt).group === group);
          return <section className="notes-group" key={group} aria-label={group}>
            <h2>{group}</h2><div className="notes-group-rows">{entries.map((note) => {
              const summary = noteSummary(note.text);
              const date = noteDate(note.updatedAt);
              return <button className="notes-row" key={note.id} data-note-id={note.id} aria-label={`Open note: ${summary.title}`} aria-describedby={`note-meta-${note.id}`} onClick={() => open(note.id, note.text)}>
                <strong>{summary.title}</strong><span className="notes-row-meta" id={`note-meta-${note.id}`}>
                  <time className="notes-row-date" dateTime={note.updatedAt ?? undefined}>{date.label}</time><span className="notes-row-preview">{summary.preview || "No additional text"}</span>
                </span>
              </button>;
            })}</div>
          </section>;
        })}
      </div>
      <div className="notes-list-bottom"><button className="notes-search" disabled aria-label="Search notes (unavailable)"><NotesIcon name="search" />Search</button>
        <button className="notes-circle notes-compose" ref={compose} aria-label="Create note" disabled={notes.length >= 1000} onClick={() => open(newNoteId(), "")}><NotesIcon name="compose" /></button>
      </div>
    </> : <>
      <h1 className="sr-only os-scene-heading" tabIndex={-1}>Note editor</h1>
      <p className="sr-only" id="notes-edit-policy">Done and Back save your changes. Home closes without saving the current draft. Use native text entry if the simulated keyboard is unsuitable.</p>
      <div className="notes-writing">
        {(["title", "body"] as const).map((field) => <textarea key={field} ref={field === "title" ? titleField : bodyField}
          className={`notes-field notes-field-${field}`} rows={field === "title" ? 1 : 4}
          aria-label={field === "title" ? "Note title" : "Note body"} aria-describedby="notes-edit-policy"
          maxLength={100_000 - view.parts.prefix.length - view.parts[field === "title" ? "body" : "title"].length - view.parts.separator.length}
          inputMode={nativeEntry ? "text" : "none"} spellCheck={false} autoCapitalize="sentences" value={view.parts[field]}
          onFocus={() => { activeField.current = field; if (!nativeEntry) setKeyboard(true); }}
          onClick={() => { activeField.current = field; if (!nativeEntry) setKeyboard(true); }}
          onKeyDown={(event) => physicalKey(event, field)}
          onChange={(event) => updateField(field, event.target.value)} />)}
      </div>
      <div className="notes-formatting" role="group" aria-label="Formatting tools">
        <button disabled aria-label="Text formatting (unavailable)">Aa</button>
        {([ ["list", "Checklist"], ["table", "Table"], ["clip", "Attachment"], ["markup", "Markup"] ] as const).map(([icon, name]) => <button disabled key={icon} aria-label={`${name} (unavailable)`}><NotesIcon name={icon} /></button>)}
        <button aria-label={keyboard ? "Dismiss simulated keyboard" : "Show simulated keyboard"} onClick={() => {
          if (keyboard) hideKeyboard();
          else { setNativeEntry(false); setKeyboard(true); (activeField.current === "title" ? titleField.current : bodyField.current)?.focus({ preventScroll: true }); }
        }}><NotesIcon name="keyboard" /></button>
        <button className="notes-native" aria-label="Use native text entry" onClick={() => {
          setNativeEntry(true); setKeyboard(false); (activeField.current === "title" ? titleField.current : bodyField.current)?.focus({ preventScroll: true });
        }}><NotesIcon name="native" /></button>
      </div>
      {keyboard && !nativeEntry && isPresent && <VirtualKeyboard onEdit={insert} onDismiss={hideKeyboard} onNativeEntry={() => { setNativeEntry(true); setKeyboard(false); }} />}
    </>}
  </section>;
}
