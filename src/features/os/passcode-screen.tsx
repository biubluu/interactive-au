"use client";

import { motion } from "motion/react";
import type { KeyboardEvent } from "react";
import { useOsReducedMotion } from "./use-os-reduced-motion";

const letters = ["", "", "ABC", "DEF", "GHI", "JKL", "MNO", "PQRS", "TUV", "WXYZ"];

// Four-digit storytelling mechanic, not real device authentication.
export function PasscodeScreen({ digits, error, onDigit, onDelete, onCancel }: Readonly<{
  digits: string; error: boolean;
  onDigit: (digit: string) => void; onDelete: () => void; onCancel: () => void;
}>) {
  const reduced = useOsReducedMotion();
  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
    if (/^\d$/.test(event.key)) { event.preventDefault(); onDigit(event.key); }
    else if (event.key === "Backspace" || event.key === "Delete") { event.preventDefault(); onDelete(); }
    else if (event.key === "Escape") { event.preventDefault(); onCancel(); }
  }
  function key(digit: number) {
    return <motion.button key={digit} className="os-pin-key" aria-label={String(digit)}
      whileTap={reduced ? { opacity: 0.7 } : { scale: 0.94 }} onClick={() => onDigit(String(digit))}>
      <span>{digit}</span><small aria-hidden="true">{letters[digit]}</small>
    </motion.button>;
  }
  return (
    <section className="os-passcode-panel" onKeyDown={onKeyDown} aria-labelledby="passcode-heading">
      <header>
        <h1 id="passcode-heading" className="os-scene-heading" tabIndex={-1}>Enter Passcode</h1>
        <motion.div className="os-pin-dots" role="img" aria-label={`${digits.length} of 4 digits entered`}
          animate={{ x: error && !reduced ? [0, -6, 6, -4, 0] : 0 }} transition={{ duration: reduced ? 0 : 0.28 }}>
          {[0, 1, 2, 3].map((index) => <span key={index} data-filled={index < digits.length} />)}
        </motion.div>
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{digits.length} of 4 digits entered</p>
        <p className="os-pin-error" role="alert">{error ? "Incorrect passcode. Try again." : ""}</p>
      </header>
      <div className="os-pin-keypad" role="group" aria-label="Passcode keypad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(key)}
        <button className="os-pin-action" onClick={onCancel}>Cancel</button>
        {key(0)}
        <button className="os-pin-action" onClick={onDelete} aria-label="Delete last digit">Delete</button>
      </div>
    </section>
  );
}
