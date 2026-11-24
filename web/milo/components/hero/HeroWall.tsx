"use client";

import { useEffect, useRef, useState } from "react";
import { MiloLogo } from "./MiloLogo";
import { logoBox, textBox } from "./layout";
import { TypeText } from "./TypeText";
import type { TileWall } from "./tileWall";

// true = show the rotating messages ("Dimmi tutto", …) next to the o of the logo
const SHOW_MESSAGES = true;

export type HeroWallText = {
  label: string;
  dial: string;
  messages: string[];
  description: string;
};

type Box = ReturnType<typeof logoBox>;
type TBox = ReturnType<typeof textBox>;

// The logo letters finish drawing about 1.5 s after they start; the text types in right after.
const TEXT_DELAY = 1.6;

export function HeroWall({ text }: { text: HeroWallText }) {
  const vpRef = useRef<HTMLDivElement>(null);
  const [logoStarted, setLogoStarted] = useState(false);
  const [box, setBox] = useState<Box>(null);
  const [tbox, setTbox] = useState<TBox>(null);

  // Keep the logo pinned to its spot on the wall whenever the hero is resized.
  useEffect(() => {
    const vp = vpRef.current!;
    const ro = new ResizeObserver(() => {
      setBox(logoBox(vp.clientWidth, vp.clientHeight));
      setTbox(textBox(vp.clientWidth, vp.clientHeight));
    });
    ro.observe(vp);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let disposed = false;
    let wall: TileWall | null = null;
    // three.js loads only in the browser, after the page shows, so it never slows the first paint.
    // The logo starts drawing once the blocks have finished rising.
    import("./tileWall")
      .then(({ createTileWall }) => {
        if (disposed || !vpRef.current) return;
        wall = createTileWall(vpRef.current, () => setLogoStarted(true));
      })
      .catch(() => setLogoStarted(true)); // no WebGL: show the logo straight away
    return () => {
      disposed = true;
      wall?.dispose();
    };
  }, []);

  return (
    <section id="intro" aria-label={text.label}>
      <div
        ref={vpRef}
        className="relative h-[calc(100svh_-_4rem)] md:h-[calc(100svh_-_84px)] min-h-[480px] w-full overflow-hidden"
        style={{ background: "#dde3e3" }}
      >
        <div
          className={box ? "absolute" : "absolute left-1/2 top-[18%] w-[78%] max-w-[520px] -translate-x-1/2"}
          style={box ? { left: `${box.left}%`, top: `${box.top}%`, width: `${box.width}%` } : undefined}
        >
          <MiloLogo
            started={logoStarted}
            messages={text.messages}
            showMessages={SHOW_MESSAGES && box !== null}
            dialLabel={text.dial}
            night={false}
          />
        </div>

        <TypeText
          text={text.description}
          started={logoStarted}
          delay={TEXT_DELAY}
          className={tbox ? "absolute m-0" : "milo-type-panel absolute inset-x-4 bottom-24 m-0 text-[14px] leading-relaxed"}
          style={tbox ? { left: `${tbox.left}%`, top: `${tbox.top}%`, width: `${tbox.width}%`, fontSize: `${tbox.fontSize}px` } : undefined}
        />
      </div>
    </section>
  );
}
