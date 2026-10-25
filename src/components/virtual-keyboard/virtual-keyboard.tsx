"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { TextEdit } from "./text-edit";
import "./virtual-keyboard.css";

/** Local presentation only. The editing app owns text and native selection. */
export function VirtualKeyboard({ onEdit, onDismiss, onNativeEntry }: Readonly<{ onEdit: (edit: TextEdit) => void; onDismiss: () => void; onNativeEntry?: () => void }>) {
  const [layout, setLayout] = useState<"letters" | "numbers" | "symbols">("letters");
  const [shift, setShift] = useState<"off" | "once" | "caps">("once");
  const reduced = useReducedMotion();
  const rows = layout === "letters" ? ["qwertyuiop", "asdfghjkl", "zxcvbnm"]
    : layout === "numbers" ? ["1234567890", "-/:;()$&@\"", ".,?!'"] : ["[]{}#%^*+=", "_\\|~<>€£¥•", ".,?!'"];
  function insert(character: string) {
    onEdit({ type: "insert", text: layout === "letters" && shift !== "off" ? character.toUpperCase() : character });
    if (shift === "once") setShift("off");
  }
  return <motion.div className="virtual-keyboard" aria-label="Simulated keyboard" role="group" data-testid="virtual-keyboard"
    initial={reduced ? false : { y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: reduced ? 0 : 0.18 }}>
    {rows.map((row, index) => <div className={`keyboard-row keyboard-row-${index}`} key={`${layout}-${index}`}>
      {index === 2 && <button type="button" className="keyboard-key keyboard-modifier" aria-label={layout === "letters" ? "Shift" : "More symbols"}
        aria-pressed={layout === "letters" ? shift !== "off" : layout === "symbols"} onPointerDown={(event) => event.preventDefault()}
        onClick={() => layout === "letters" ? setShift(shift === "off" ? "once" : shift === "once" ? "caps" : "off") : setLayout(layout === "numbers" ? "symbols" : "numbers")}>
        {layout === "letters" ? <KeyboardGlyph name={shift === "caps" ? "caps" : "shift"} /> : "#+="}</button>}
      {Array.from(row).map((character) => {
        const label = layout === "letters" && shift !== "off" ? character.toUpperCase() : character;
        return <button type="button" className="keyboard-key" key={character} aria-label={`Type ${label}`}
          onPointerDown={(event) => event.preventDefault()} onClick={() => insert(character)}>{label}</button>;
      })}
      {index === 2 && <button type="button" className="keyboard-key keyboard-modifier" aria-label="Backspace" onPointerDown={(event) => event.preventDefault()} onClick={() => onEdit({ type: "backspace" })}><KeyboardGlyph name="delete" /></button>}
    </div>)}
    <div className="keyboard-row">
      <button type="button" className="keyboard-key keyboard-modifier" aria-label={layout === "letters" ? "Numbers and symbols" : "Alphabetic keyboard"}
        onPointerDown={(event) => event.preventDefault()} onClick={() => setLayout(layout === "letters" ? "numbers" : "letters")}>{layout === "letters" ? "123" : "ABC"}</button>
      <button type="button" className="keyboard-key keyboard-globe keyboard-modifier" aria-label="Switch to native keyboard" disabled={!onNativeEntry}
        onPointerDown={(event) => event.preventDefault()} onClick={onNativeEntry}><KeyboardGlyph name="globe" /></button>
      <button type="button" className="keyboard-key keyboard-space" aria-label="Space" onPointerDown={(event) => event.preventDefault()} onClick={() => onEdit({ type: "insert", text: " " })}>space</button>
      <button type="button" className="keyboard-key keyboard-return keyboard-modifier" aria-label="Return" onPointerDown={(event) => event.preventDefault()} onClick={() => onEdit({ type: "insert", text: "\n" })}><KeyboardGlyph name="return" /></button>
      <button type="button" className="keyboard-key keyboard-hide keyboard-modifier" aria-label="Hide keyboard" onPointerDown={(event) => event.preventDefault()} onClick={onDismiss}><KeyboardGlyph name="hide" /></button>
    </div>
  </motion.div>;
}

/** Original vector keycaps; no font-dependent modifier glyphs or Apple assets. */
function KeyboardGlyph({ name }: Readonly<{ name: "shift" | "caps" | "delete" | "return" | "hide" | "globe" }>) {
  const paths = {
    shift: "m3 11 9-8 9 8h-5v10H8V11z",
    caps: "m3 10 9-8 9 8h-5v7H8v-7zM8 21h8",
    delete: "M9 5h12v14H9l-7-7zM12 9l6 6m0-6-6 6",
    return: "M20 4v10H4m5-5-5 5 5 5",
    hide: "m5 9 7 7 7-7",
    globe: "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0M2 12h20M12 2c-5 5-5 15 0 20M12 2c5 5 5 15 0 20",
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={paths[name]} /></svg>;
}
