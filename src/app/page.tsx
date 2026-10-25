export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-2xl flex-col justify-center gap-8 px-6 py-16 sm:px-10">
      <header className="space-y-4">
        <p className="text-sm font-medium tracking-widest text-stone-400">PLACEHOLDER / PHASE 1</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">Interactive AU</h1>
        <p className="max-w-prose text-lg leading-relaxed text-stone-300">
          A space for one alternate-universe story. The story and virtual apps are still to be decided.
        </p>
      </header>
      <a
        href="#experience-placeholder"
        aria-describedby="entry-description"
        className="inline-flex min-h-12 w-fit items-center justify-center rounded-full bg-stone-100 px-6 py-3 font-semibold text-stone-950 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        Enter Experience
      </a>
      <section id="experience-placeholder" aria-labelledby="placeholder-heading" tabIndex={-1} className="scroll-mt-6 rounded-2xl border border-stone-700 p-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
        <h2 id="placeholder-heading" className="text-lg font-semibold">Experience placeholder</h2>
        <p id="entry-description" className="mt-2 leading-relaxed text-stone-300">
          PLACEHOLDER: the experience is not available yet. This link leads only to this notice; no story has started.
        </p>
      </section>
    </main>
  );
}
