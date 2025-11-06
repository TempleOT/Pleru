"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Shell from "@/components/Shell";

type Section =
  | "will"
  | "essence"
  | "rhythm"
  | "body"
  | "devotion"
  | "reflection";

/* ─────────────────────────────────────────────
   DATA DEFINITIONS
   ───────────────────────────────────────────── */

// 1. WILL
const WILL_STEPS = [
  {
    title: "1 — Understand What Will Truly Is",
    body: "Ego’s will tries to control; Essence’s will simply moves. Today pause before acting and ask: “Is this ego forcing, or essence flowing?” Let clarity move you, not tension.",
  },
  {
    title: "2 — Transmute Energy into Fire",
    body: "Your sexual and emotional energy is sacred fuel. Don’t leak it. Keep your vow. Every time you master desire, the inner flame grows. Observe the impulse without obeying it.",
  },
  {
    title: "3 — Anchor Will in Daily Action",
    body: "Spirit cannot flow through inertia. Choose one act today and complete it fully. Teach your system that your word equals law.",
  },
  {
    title: "4 — Align with a Cause Larger Than You",
    body: "When your work serves awakening, love, or truth, the current carries you. Do one sacred act today.",
  },
  {
    title: "5 — Face Resistance Consciously",
    body: "Friction is the weight for the muscle of will. Stay present inside boredom, doubt, or discomfort.",
  },
];
const WILL_SUPPORT = [
  [
    { label: "Discernment check", text: "Is this ego forcing or Essence moving? Choose the quieter impulse." },
    { label: "Mind anchor", text: "3 breaths • soften brow • drop into heart." },
    { label: "Why this matters", text: "You can’t align action if you don’t know who is acting." },
  ],
  [
    { label: "Vow reminder", text: "“If I give in now, I spit on my vow.” Containment feeds will." },
    { label: "Transmutation", text: "Lift desire to heart; offer it upward." },
    { label: "Why containment", text: "Leaked energy cannot become fire." },
  ],
  [
    { label: "One act today", text: "Finish one thing. Completion teaches the body your word = law." },
    { label: "Momentum", text: "Small, done, daily > big, never." },
    { label: "Why action", text: "Spirit can’t steer what isn’t moving." },
  ],
  [
    { label: "Service prompt", text: "Do something that serves awakening, not ego reward." },
    { label: "Offer work", text: "“Use this for Truth.”" },
    { label: "Why higher cause", text: "Sacred direction stabilizes will." },
  ],
  [
    { label: "Stay in the fire", text: "Don’t run from discomfort — breathe inside it." },
    { label: "Nervous system", text: "Exhale longer than you inhale." },
    { label: "Why resistance", text: "Friction forges." },
  ],
];

// 2. ESSENCE
const ESSENCE_STEPS = [
  {
    title: "1 — Return to Original Tone",
    body: "Essence is remembered, not achieved. Soften the performance today and act from your unforced note.",
  },
  {
    title: "2 — Remove Distortion",
    body: "Noise, comparison, and pleasing cloud your signal. Lower one source of static today.",
  },
  {
    title: "3 — Embody Quiet Beauty",
    body: "Do one beautiful thing with no announcement — order, fragrance, clean text.",
  },
  {
    title: "4 — Relate from Essence",
    body: "Speak from center, not from defense. Let presence be the teaching.",
  },
  {
    title: "5 — Rest Back into Being",
    body: "Essence is presence. Let something happen today without your push.",
  },
];
const ESSENCE_SUPPORT = [
  [
    { label: "Breath to center", text: "Inhale to heart, exhale down the spine. Land first." },
    { label: "Signal check", text: "Does this feel like me, or like what I think I should be?" },
    { label: "Why this matters", text: "You can’t offer Essence if you’re imitating." },
  ],
  [
    { label: "Reduce noise", text: "Mute one input for the day — socials, group chat, background content." },
    { label: "Essence diet", text: "Consume what feels clean, symbolic, devotional." },
    { label: "Why remove distortion", text: "Essence is clear by default." },
  ],
  [
    { label: "Beauty practice", text: "Arrange your space or words with reverence." },
    { label: "Gratitude line", text: "Thank reality for one thing today." },
    { label: "Why beauty", text: "Beauty is Essence made visible." },
  ],
  [
    { label: "Heart speech", text: "Pause: is this my Essence or my insecurity speaking?" },
    { label: "Soft eyes", text: "Meet someone today with unguarded eyes." },
    { label: "Why relationship", text: "Essence shared stabilizes Essence." },
  ],
  [
    { label: "Release control", text: "Let one thing unfold without managing it." },
    { label: "Body soften", text: "Relax jaw, shoulders, belly. Presence doesn’t sprint." },
    { label: "Why rest", text: "Essence is the part of you that doesn’t have to earn." },
  ],
];

// 3. RHYTHM
const RHYTHM_STEPS = [
  {
    title: "1 — Sense Today’s Tempo",
    body: "Ask your body: is today a high, medium, or low day? Let that set your pace.",
  },
  {
    title: "2 — Match Output to Energy",
    body: "Don’t demand peak output on an empty battery. Align action with energy available.",
  },
  {
    title: "3 — Protect Sacred Pauses",
    body: "Keep micro-pauses between tasks. Rhythm needs space to breathe.",
  },
  {
    title: "4 — Ride the Wave",
    body: "Every day has a rise and fall. Work with it, don’t fight it.",
  },
  {
    title: "5 — Close the Day",
    body: "End consciously — review, thank, release. Don’t just collapse.",
  },
];
const RHYTHM_SUPPORT = [
  [
    { label: "Body check", text: "Where are you tense? That tells you today’s speed." },
    { label: "Why tempo", text: "Alignment breaks when pace outruns soul." },
    { label: "Breath sync", text: "4-count in, 4-count out for even rhythm." },
  ],
  [
    { label: "Energy budget", text: "Pick 1–3 priorities only." },
    { label: "No forcing", text: "Don’t do ‘hero days’ daily." },
    { label: "Why match", text: "Matching energy prevents disalignment crashes." },
  ],
  [
    { label: "Pause ritual", text: "After a task: breathe, sip, look away from screen." },
    { label: "Phone gate", text: "No doom-scroll between tasks." },
    { label: "Why pauses", text: "Pauses let Essence re-enter." },
  ],
  [
    { label: "Ride the rise", text: "When energy rises, do the hard thing first." },
    { label: "Honor the fall", text: "When energy drops, switch to low-cog work." },
    { label: "Why wave", text: "Fighting natural waves creates burnout." },
  ],
  [
    { label: "Closing line", text: "“Day complete. I did enough.”" },
    { label: "Evening guard", text: "Stop input after a set hour." },
    { label: "Why close", text: "Unclosed days bleed into tomorrow." },
  ],
];

// 4. BODY / VESSEL
const BODY_STEPS = [
  {
    title: "1 — Listen to the Vessel",
    body: "Before doing, ask the body what it needs: rest, water, movement, or stillness.",
  },
  {
    title: "2 — Breathe as Temple",
    body: "3–5 slow, deep breaths to signal safety. A calm body obeys Spirit better.",
  },
  {
    title: "3 — Nourish Cleanly",
    body: "Eat/drink in a way that honors your future self today.",
  },
  {
    title: "4 — Move Energy",
    body: "Walk, stretch, shake, or practice — don’t let energy stagnate.",
  },
  {
    title: "5 — Thank the Form",
    body: "Close the day by thanking your body for carrying consciousness.",
  },
];
const BODY_SUPPORT = [
  [
    { label: "Scan", text: "Jaw, shoulders, belly — soften all three." },
    { label: "Why vessel", text: "Spirit needs a stable container." },
    { label: "Water", text: "Drink before more stimulation." },
  ],
  [
    { label: "Breath pattern", text: "In 4 • hold 2 • out 6." },
    { label: "Nervous system", text: "Long exhale = safe body." },
    { label: "Why breath", text: "You can’t align if your body is alarmed." },
  ],
  [
    { label: "Food check", text: "Will this make me clearer or foggier?" },
    { label: "Savor", text: "Eat present, not scrolling." },
    { label: "Why nourishment", text: "Clarity is physical, not just spiritual." },
  ],
  [
    { label: "Move it", text: "10–15 min walk/stretch is enough." },
    { label: "Shake off", text: "Release tension after intense calls." },
    { label: "Why movement", text: "Stagnant body → stagnant will." },
  ],
  [
    { label: "Gratitude", text: "“Thank you, body, for today.”" },
    { label: "Sleep prep", text: "Dim lights, slow input." },
    { label: "Why thanks", text: "Honor increases cooperation." },
  ],
];

// 5. DEVOTION / OFFERING
const DEVOTION_STEPS = [
  {
    title: "1 — Remember Who You Serve",
    body: "Name the higher current today — God, Truth, Love, Awakening. Let that be your why.",
  },
  {
    title: "2 — Offer One Act Unseen",
    body: "Do something kind, excellent, or beautiful without announcing it.",
  },
  {
    title: "3 — Speak Blessing",
    body: "Let your words today be temple words. Bless instead of criticize.",
  },
  {
    title: "4 — Give Attention as Prayer",
    body: "Listen fully to one person or task. Undivided attention is devotion.",
  },
  {
    title: "5 — Close in Gratitude",
    body: "Return the day: “What I have was given; what I give is returned.”",
  },
];
const DEVOTION_SUPPORT = [
  [
    { label: "Morning dedication", text: "“Use me today for awakening.”" },
    { label: "Why devotion", text: "Will burns out without love." },
    { label: "Center", text: "Do it for the Beloved, not the audience." },
  ],
  [
    { label: "Secret service", text: "Bless in secret — it purifies intent." },
    { label: "Almsgiving", text: "Give small, consistently." },
    { label: "Why unseen", text: "Hidden giving grows true stature." },
  ],
  [
    { label: "Tongue guard", text: "No gossip, no cursing the day." },
    { label: "Speak life", text: "Bless your work, body, and people." },
    { label: "Why speech", text: "Words set the atmosphere." },
  ],
  [
    { label: "Single focus", text: "For 10 minutes, do 1 thing in full presence." },
    { label: "Why attention", text: "Attention is the purest offering." },
    { label: "Presence", text: "Let them feel seen, not fixed." },
  ],
  [
    { label: "Return it", text: "“All of this was yours.”" },
    { label: "Why gratitude", text: "Gratitude keeps the channel open." },
    { label: "Soft close", text: "End the day in reverence, not exhaustion." },
  ],
];

// 6. REFLECTION / INTEGRATION
const REFLECTION_STEPS = [
  {
    title: "1 — Name Today’s Alignment",
    body: "What did I do today that matched my design? Name it.",
  },
  {
    title: "2 — Name Today’s Friction",
    body: "Where did I resist, leak, or perform? Bring it to light.",
  },
  {
    title: "3 — Extract the Teaching",
    body: "What did today reveal about my pattern, will, or Essence?",
  },
  {
    title: "4 — Choose a Correction",
    body: "What will I do differently next time? Make it small and real.",
  },
  {
    title: "5 — Seal with Appreciation",
    body: "Thank life for the lesson so it can integrate, not repeat.",
  },
];
const REFLECTION_SUPPORT = [
  [
    { label: "Journal cue", text: "“Where was I true today?”" },
    { label: "Why notice", text: "What you notice grows." },
    { label: "Gentleness", text: "Celebrate even small alignments." },
  ],
  [
    { label: "Leak scan", text: "Where did I betray my own energy?" },
    { label: "No shame", text: "Friction is feedback, not failure." },
    { label: "Why reveal", text: "Seen patterns loosen." },
  ],
  [
    { label: "One insight", text: "Write 1 sentence of truth from today." },
    { label: "Share (optional)", text: "Speak it to someone aligned." },
    { label: "Why teaching", text: "Expression deepens learning." },
  ],
  [
    { label: "Micro-correction", text: "Pick 1 change, not 10." },
    { label: "Why small", text: "Tiny faithful shifts become identity." },
    { label: "Tomorrow cue", text: "Place it at the start of the next day." },
  ],
  [
    { label: "Gratitude", text: "“Thank you for today’s lesson.”" },
    { label: "Why seal", text: "Appreciation closes the loop." },
    { label: "Rest", text: "Let it land — no more input." },
  ],
];

/* ─────────────────────────────────────────────
   PAGE COMPONENT
   ───────────────────────────────────────────── */

export default function AlignmentPage() {
  const [section, setSection] = useState<Section>("will");

  const [indices, setIndices] = useState<Record<Section, number>>({
    will: 0,
    essence: 0,
    rhythm: 0,
    body: 0,
    devotion: 0,
    reflection: 0,
  });

  const [doneMap, setDoneMap] = useState<Record<Section, boolean>>({
    will: false,
    essence: false,
    rhythm: false,
    body: false,
    devotion: false,
    reflection: false,
  });

  const [fading, setFading] = useState(false);
  const [showDoctrine, setShowDoctrine] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const today = new Date();
    const day = today.getDate();

    const newIndices: Record<Section, number> = {
      will: day % WILL_STEPS.length,
      essence: day % ESSENCE_STEPS.length,
      rhythm: day % RHYTHM_STEPS.length,
      body: day % BODY_STEPS.length,
      devotion: day % DEVOTION_STEPS.length,
      reflection: day % REFLECTION_STEPS.length,
    };

    const newDone: Record<Section, boolean> = { ...doneMap };

    (["will", "essence", "rhythm", "body", "devotion", "reflection"] as Section[]).forEach(
      (s) => {
        const key = `pleru:align:${s}:done:${today.toDateString()}`;
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem(key);
          newDone[s] = stored === "true";
        }
      }
    );

    setIndices(newIndices);
    setDoneMap(newDone);

    setTimeout(() => setHeroVisible(true), 80);
  }, []);

  function getStepsFor(section: Section) {
    switch (section) {
      case "will":
        return WILL_STEPS;
      case "essence":
        return ESSENCE_STEPS;
      case "rhythm":
        return RHYTHM_STEPS;
      case "body":
        return BODY_STEPS;
      case "devotion":
        return DEVOTION_STEPS;
      case "reflection":
        return REFLECTION_STEPS;
    }
  }

  function getSupportFor(section: Section, idx: number) {
    switch (section) {
      case "will":
        return WILL_SUPPORT[idx] ?? [];
      case "essence":
        return ESSENCE_SUPPORT[idx] ?? [];
      case "rhythm":
        return RHYTHM_SUPPORT[idx] ?? [];
      case "body":
        return BODY_SUPPORT[idx] ?? [];
      case "devotion":
        return DEVOTION_SUPPORT[idx] ?? [];
      case "reflection":
        return REFLECTION_SUPPORT[idx] ?? [];
    }
  }

  function getHeroTitle(section: Section) {
    switch (section) {
      case "will":
        return "Will";
      case "essence":
        return "Essence";
      case "rhythm":
        return "Rhythm";
      case "body":
        return "Body";
      case "devotion":
        return "Devotion";
      case "reflection":
        return "Reflection";
    }
  }

  function getHeroSubtitle(section: Section) {
    switch (section) {
      case "will":
        return "The fire of awakening lives in disciplined will — not control, but clarity. Each act of alignment refines the vessel for higher purpose.";
      case "essence":
        return "Essence is your unforced note. Remove distortion, return to your original tone, and let presence transmit.";
      case "rhythm":
        return "Walk at the speed your soul can hear. Alignment is not doing more, but doing in tune with your day’s wave.";
      case "body":
        return "The body is the altar of consciousness. Care for it so Spirit has a steady place to land.";
      case "devotion":
        return "Offer what you are back to what sent you. Devotion keeps the current of love alive in the work.";
      case "reflection":
        return "Integration seals transformation. See the day, name the lesson, and carry it forward.";
    }
  }

  const steps = getStepsFor(section);
  const currentIndex = indices[section];
  const currentStep = steps[currentIndex];
  const supportCards = getSupportFor(section, currentIndex);
  const isDone = doneMap[section];

  function changeStep(newIndex: number) {
    setFading(true);
    setTimeout(() => {
      setIndices((prev) => ({ ...prev, [section]: newIndex }));
      setDoneMap((prev) => ({ ...prev, [section]: false }));
      setFading(false);
    }, 160);
  }

  function nextStep() {
    const newIndex = (currentIndex + 1) % steps.length;
    changeStep(newIndex);
  }

  function prevStep() {
    const newIndex = (currentIndex - 1 + steps.length) % steps.length;
    changeStep(newIndex);
  }

  function markDone() {
    const today = new Date();
    const key = `pleru:align:${section}:done:${today.toDateString()}`;
    if (typeof window !== "undefined") {
      localStorage.setItem(key, "true");
    }
    setDoneMap((prev) => ({ ...prev, [section]: true }));
  }

  // now supports modes
  function openAiPanel(context?: { mode?: "talk" | "reflect"; section?: Section; step?: any }) {
    if (context?.mode === "reflect") {
      console.log("AI: reflect on my day");
      return;
    }
    console.log("AI: talk about step", {
      section,
      step: currentStep,
      index: currentIndex,
    });
  }

  const sectionOrder: Section[] = [
    "will",
    "essence",
    "rhythm",
    "body",
    "devotion",
    "reflection",
  ];

  function goToPreviousModule() {
    const currentIdx = sectionOrder.indexOf(section);
    const prevIdx = (currentIdx - 1 + sectionOrder.length) % sectionOrder.length;
    setSection(sectionOrder[prevIdx]);
    setShowDoctrine(false);
  }

  function goToNextModule() {
    const currentIdx = sectionOrder.indexOf(section);
    const nextIdx = (currentIdx + 1) % sectionOrder.length;
    setSection(sectionOrder[nextIdx]);
    setShowDoctrine(false);
  }

  return (
    <Shell>
      <div className="relative max-w-6xl mx-auto">
        {/* golden module arrows */}
        <button
          onClick={goToPreviousModule}
          className="hidden sm:flex absolute -top-6 left-0 h-9 w-9 rounded-full bg-gold/90 text-neutral-950 items-center justify-center shadow-lg hover:bg-gold transition"
          aria-label="Previous section"
        >
          ←
        </button>
        <button
          onClick={goToNextModule}
          className="hidden sm:flex absolute -top-6 right-0 h-9 w-9 rounded-full bg-gold/90 text-neutral-950 items-center justify-center shadow-lg hover:bg-gold transition"
          aria-label="Next section"
        >
          →
        </button>

        {/* hero */}
        <div
          className={`text-center transition-all duration-400 ${
            heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <h1 className="text-3xl font-semibold text-gold tracking-wide">
            {getHeroTitle(section)}
          </h1>
          <p className="text-neutral-400 mt-2 max-w-2xl mx-auto text-sm leading-relaxed">
            {getHeroSubtitle(section)}
          </p>
        </div>

        {/* main layout */}
        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(260px,0.55fr)] text-left">
          {/* LEFT SIDE */}
          <div>
            <div className="card relative p-6 group transition">
              <p className="text-xs tracking-wide uppercase text-neutral-500 mb-3">
                {section === "will"
                  ? "Awakening Will — The Fire of Alignment"
                  : section === "essence"
                  ? "Essence Attunement — The Quiet Transmission"
                  : section === "rhythm"
                  ? "Rhythmic Alignment — The Pace of the Day"
                  : section === "body"
                  ? "Vessel Care — Housing the Light"
                  : section === "devotion"
                  ? "Devotional Alignment — Offering the Day"
                  : "Reflection — Integration of the Work"}
              </p>

              {/* step arrows */}
              <div className="absolute top-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={prevStep}
                  className="h-8 w-8 rounded-full bg-neutral-900/70 border border-neutral-700 flex items-center justify-center text-neutral-200 hover:bg-neutral-800 transition"
                  aria-label="Previous step"
                >
                  ←
                </button>
                <button
                  onClick={nextStep}
                  className="h-8 w-8 rounded-full bg-neutral-900/70 border border-neutral-700 flex items-center justify-center text-neutral-200 hover:bg-neutral-800 transition"
                  aria-label="Next step"
                >
                  →
                </button>
              </div>

              {/* step content */}
              <div
                className={`transition-opacity duration-200 ${
                  fading ? "opacity-0" : "opacity-100"
                }`}
              >
                <h2 className="text-lg font-medium mb-2">{currentStep.title}</h2>
                <p className="text-neutral-200 leading-relaxed">{currentStep.body}</p>

                {/* actions */}
                <div className="mt-5 flex flex-wrap gap-3 items-center">
                  {!isDone ? (
                    <button
                      onClick={markDone}
                      className="rounded-md bg-gold/90 text-neutral-950 px-4 py-2 text-sm font-medium hover:bg-gold transition"
                    >
                      {section === "essence"
                        ? "Attune for today"
                        : section === "reflection"
                        ? "Log reflection"
                        : "Mark as aligned today"}
                    </button>
                  ) : (
                    <p className="text-emerald-300 text-sm">
                      {section === "essence"
                        ? "Essence attuned ✔"
                        : section === "reflection"
                        ? "Reflection logged ✔"
                        : "Aligned for today ✔"}
                    </p>
                  )}

                  <button
                    onClick={() =>
                      openAiPanel({
                        mode: "talk",
                        section,
                        step: currentStep,
                      })
                    }
                    className="text-sm px-4 py-2 rounded-md border border-neutral-700/70 text-neutral-200 hover:border-gold/70 transition"
                  >
                    Talk about this
                  </button>
                </div>

                {isDone && (
                  <p className="mt-5 text-sm text-neutral-400">
                    {section === "will"
                      ? "Hold the flame steady. Repetition > intensity."
                      : section === "essence"
                      ? "Stay soft. Essence is remembered, not forced."
                      : section === "rhythm"
                      ? "Honor today’s tempo — that is alignment."
                      : section === "body"
                      ? "A thanked body becomes a willing vessel."
                      : section === "devotion"
                      ? "What you offer returns refined."
                      : "Seeing the day completes the practice."}
                  </p>
                )}
              </div>

              {/* dots */}
              <div className="flex justify-center gap-2 mt-6">
                {steps.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-2 w-2 rounded-full ${
                      currentIndex === idx ? "bg-gold" : "bg-neutral-700"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* section-specific principles */}
            {section === "will" && (
              <div className="mt-6 text-sm text-neutral-500 space-y-1">
                <p className="text-neutral-400 uppercase tracking-wide text-xs">
                  Formula of Awakening Will
                </p>
                <p>1. Contain energy — transmute lust, preserve life-force.</p>
                <p>2. Commit to truth — no self-betrayal, no excuses.</p>
                <p>3. Serve the higher current — act for Gnosis and compassion.</p>
                <p>4. Act consistently — daily embodiment over talk.</p>
                <p>5. Endure resistance — stay present through friction.</p>
              </div>
            )}

            {section === "essence" && (
              <div className="mt-6 text-sm text-neutral-500 space-y-1">
                <p className="text-neutral-400 uppercase tracking-wide text-xs">
                  Principles of Essence
                </p>
                <p>1. Essence is original — not improved.</p>
                <p>2. Remove noise before adding effort.</p>
                <p>3. Express beauty quietly.</p>
                <p>4. Relate from center, not persona.</p>
                <p>5. Rest — being transmits more than doing.</p>
              </div>
            )}

            {section === "rhythm" && (
              <div className="mt-6 text-sm text-neutral-500 space-y-1">
                <p className="text-neutral-400 uppercase tracking-wide text-xs">
                  Laws of Rhythmic Alignment
                </p>
                <p>1. Feel the day before planning it.</p>
                <p>2. Match energy to output.</p>
                <p>3. Keep pauses sacred.</p>
                <p>4. Work with waves, not against them.</p>
                <p>5. End consciously.</p>
              </div>
            )}

            {section === "body" && (
              <div className="mt-6 text-sm text-neutral-500 space-y-1">
                <p className="text-neutral-400 uppercase tracking-wide text-xs">
                  Pillars of the Vessel
                </p>
                <p>1. Listen first.</p>
                <p>2. Breathe safety.</p>
                <p>3. Nourish cleanly.</p>
                <p>4. Move energy.</p>
                <p>5. Thank the form.</p>
              </div>
            )}

            {section === "devotion" && (
              <div className="mt-6 text-sm text-neutral-500 space-y-1">
                <p className="text-neutral-400 uppercase tracking-wide text-xs">
                  Path of Devotion
                </p>
                <p>1. Remember Who you serve.</p>
                <p>2. Offer unseen.</p>
                <p>3. Speak blessing.</p>
                <p>4. Give attention as prayer.</p>
                <p>5. Return in gratitude.</p>
              </div>
            )}

            {section === "reflection" && (
              <div className="mt-6 text-sm text-neutral-500 space-y-1">
                <p className="text-neutral-400 uppercase tracking-wide text-xs">
                  Cycle of Integration
                </p>
                <p>1. Notice alignment.</p>
                <p>2. Acknowledge friction.</p>
                <p>3. Extract the teaching.</p>
                <p>4. Choose the correction.</p>
                <p>5. Seal with appreciation.</p>
              </div>
            )}

            {/* deeper teaching / doctrine */}
            <div className="mt-8 card p-5 bg-neutral-950/40 border border-neutral-900/60">
              <button
                onClick={() => setShowDoctrine((s) => !s)}
                className="w-full flex items-center justify-between gap-4 text-left"
              >
                <div>
                  <p className="text-xs uppercase tracking-wide text-neutral-500">
                    Deeper teaching
                  </p>
                  <h3 className="text-base md:text-lg font-semibold text-gold">
                    {section === "will"
                      ? "Inner Necessity — The Law of Aligned Will"
                      : section === "essence"
                      ? "Original Note — The Law of Essence"
                      : section === "rhythm"
                      ? "The Law of Right Timing"
                      : section === "body"
                      ? "Temple Principle — Spirit Needs Structure"
                      : section === "devotion"
                      ? "The Law of Offering"
                      : "The Law of Witnessing"}
                  </h3>
                </div>
                <span
                  className={`h-7 w-7 rounded-full border border-neutral-700 flex items-center justify-center text-neutral-200 transition ${
                    showDoctrine ? "rotate-90" : ""
                  }`}
                >
                  →
                </span>
              </button>

              {showDoctrine && section === "will" && (
                <div className="mt-4 space-y-3 text-sm text-neutral-300 leading-relaxed">
                  <p>
                    When you center outer motives, will fragments. When you center inner inevitability,
                    effort dissolves.
                  </p>
                  <p className="font-medium text-neutral-100">How to apply</p>
                  <p>Pick one line of expression. Remove dilution. Feed it daily.</p>
                </div>
              )}

              {showDoctrine && section === "essence" && (
                <div className="mt-4 space-y-3 text-sm text-neutral-300 leading-relaxed">
                  <p>Essence doesn’t get louder — we get quieter.</p>
                  <p className="font-medium text-neutral-100">Remove distortion</p>
                  <p>Lower inputs until your own tone is obvious again.</p>
                </div>
              )}

              {showDoctrine && section === "rhythm" && (
                <div className="mt-4 space-y-3 text-sm text-neutral-300 leading-relaxed">
                  <p>Nothing aligned is rushed. Rhythm is consent to Divine pacing.</p>
                  <p className="font-medium text-neutral-100">Practice</p>
                  <p>Sense → Match → Pause → Ride → Close.</p>
                </div>
              )}

              {showDoctrine && section === "body" && (
                <div className="mt-4 space-y-3 text-sm text-neutral-300 leading-relaxed">
                  <p>Light needs form. A neglected vessel scatters the work.</p>
                  <p className="font-medium text-neutral-100">Practice</p>
                  <p>Honor your body daily in one simple way.</p>
                </div>
              )}

              {showDoctrine && section === "devotion" && (
                <div className="mt-4 space-y-3 text-sm text-neutral-300 leading-relaxed">
                  <p>What you offer returns multiplied — but not always to the same place.</p>
                  <p className="font-medium text-neutral-100">Practice</p>
                  <p>Give unseen. Bless aloud. Return in gratitude.</p>
                </div>
              )}

              {showDoctrine && section === "reflection" && (
                <div className="mt-4 space-y-3 text-sm text-neutral-300 leading-relaxed">
                  <p>Transformation isn’t complete until it’s witnessed.</p>
                  <p className="font-medium text-neutral-100">Practice</p>
                  <p>End the day by naming truth. What you see, stays.</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-4">
            {supportCards.map((card) => (
              <div key={card.label} className="card p-4">
                <p className="text-xs uppercase tracking-wide text-neutral-500">
                  {card.label}
                </p>
                <p className="mt-2 text-sm text-neutral-200">{card.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Reflection / Bridge strip */}
        <div className="relative mt-12 mb-10">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent pointer-events-none"></div>
          <div className="pt-8 text-center">
            <p className="text-neutral-400 text-sm mb-4">
              End the day with awareness — or continue your journey in the Bridge.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => openAiPanel({ mode: "reflect" })}
                className="px-5 py-2 rounded-md border border-neutral-700/70 text-neutral-200 hover:border-gold/70 hover:text-gold transition text-sm"
              >
                Reflect on my day
              </button>
              <Link
                href="/bridge"
                className="px-5 py-2 rounded-md bg-gold/90 text-neutral-950 hover:bg-gold transition text-sm font-medium"
              >
                Go to Bridge
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
