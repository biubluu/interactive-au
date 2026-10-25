import { PhoneShell } from "../components/device/phone-shell";

export default function LandingPage() {
  return (
    <main className="device-stage">
      <PhoneShell>
        <div className="shell-demo flex min-h-full flex-col justify-end gap-5">
          <header className="space-y-3">
            <p className="text-xs font-semibold tracking-[0.16em] text-white/80">PLACEHOLDER / DEVICE STUDY</p>
            <h1 className="text-[2.5rem] leading-[1.05] font-semibold tracking-tight text-white">Interactive AU</h1>
            <p className="text-base leading-relaxed text-stone-200">
              One story. A different universe.
            </p>
          </header>
          <a
            href="#experience-placeholder"
            aria-describedby="entry-description"
            className="inline-flex min-h-12 w-full shrink-0 items-center justify-center rounded-full bg-stone-100 px-6 py-3 text-base font-semibold text-stone-950 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Enter Experience
          </a>
          <section id="experience-placeholder" aria-labelledby="placeholder-heading" tabIndex={-1} className="rounded-2xl border border-white/15 bg-stone-950/70 p-4 text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
            <h2 id="placeholder-heading" className="text-base font-semibold">Experience placeholder</h2>
            <p id="entry-description" className="mt-2 text-sm leading-relaxed text-stone-200">
              PLACEHOLDER: the experience is not available yet. No story has started.
            </p>
          </section>
        </div>
      </PhoneShell>
    </main>
  );
}
