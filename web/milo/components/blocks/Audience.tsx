import type { Dictionary } from "@milo/lib/dictionaries";
import { ChatBubbles } from "./ChatBubbles";
import { Reveal } from "./Reveal";
import "./blocks.css";

// Block: who Milo is for. Text on the left, animated glass chat bubbles on the right.

const delay = (s: number) => ({ "--d": `${s}s` }) as React.CSSProperties;

export function Audience({ audience }: { audience: Dictionary["audience"] }) {
  const groups = [audience.primary, audience.secondary];
  return (
    <section id="audience" aria-labelledby="audience-title" className="aud">
      <div className="mx-auto grid max-w-[1560px] items-center gap-16 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:px-12 lg:py-32">
        <Reveal>
          <p className="why-eyebrow why-up flex items-center gap-3" style={delay(0)}>
            <span className="why-part-num">01</span>
            <span aria-hidden="true" className="why-part-line" />
            {audience.eyebrow}
          </p>
          <h2
            id="audience-title"
            style={delay(0.08)}
            className="why-up aud-title mt-6 font-bold text-balance"
          >
            {audience.title}
          </h2>

          <div className="mt-14 space-y-12 lg:mt-20">
            {groups.map((g, i) => (
              <div key={g.title} className="why-up max-w-xl" style={delay(0.22 + i * 0.14)}>
                <p className="why-tag text-sm">{g.label}</p>
                <h3 className="mt-3 text-2xl font-semibold leading-snug sm:text-[26px]">{g.title}</h3>
                <p className="mt-4 text-lg leading-relaxed" style={{ color: "var(--why-muted)" }}>
                  {g.text}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        <ChatBubbles label={audience.animationLabel} />
      </div>
    </section>
  );
}
