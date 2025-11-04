'use client';
import Shell from '@/components/Shell';

export default function AboutPage() {
  return (
    <Shell>
      <h1 className="text-2xl font-semibold text-gold">About Pleru</h1>
      <p className="text-neutral-400 mt-1">Purpose • Design • How to use</p>

      <div className="mt-6 grid gap-4">
        <section className="card p-5">
          <h2 className="text-lg font-medium text-neutral-100">Purpose</h2>
          <p className="text-neutral-300 mt-2">
            Pleru is a sacred, minimal environment to remember who you are and act from Essence.
            It helps you bridge ego → essence through reflection, learning, and calm structure.
          </p>
        </section>

        <section className="card p-5">
          <h2 className="text-lg font-medium text-neutral-100">Design</h2>
          <ul className="list-disc pl-5 text-neutral-300 mt-2 space-y-1">
            <li><b>Bridge</b> — entry tone and orientation.</li>
            <li><b>Reflect</b> — guided journaling that saves your progress.</li>
            <li><b>Codex</b> — Ego ↔ Essence entries with Temple Keys (tiers).</li>
            <li><b>Progress Flame</b> — a mirror of alignment over time.</li>
            <li><b>Elements (5)</b> — Fire, Air, Water, Earth, Ether harmonized.</li>
          </ul>
        </section>

        <section className="card p-5">
          <h2 className="text-lg font-medium text-neutral-100">How to Use</h2>
          <ol className="list-decimal pl-5 text-neutral-300 mt-2 space-y-2">
            <li>Open <b>Reflect</b>, write one honest paragraph. Save.</li>
            <li>Visit the <b>Codex</b> when a pattern repeats. Read Ego ↔ Essence.</li>
            <li>Return daily; watch the <b>Progress Flame</b> rise with consistency.</li>
          </ol>
        </section>

        <section className="card p-5">
          <h2 className="text-lg font-medium text-neutral-100">Ethos</h2>
          <p className="text-neutral-300 mt-2">
            The tone is direct but compassionate — a mirror that includes one practical step (Mirror +1).
            We keep the interface quiet so your awareness can speak.
          </p>
        </section>
      </div>
    </Shell>
  );
}
