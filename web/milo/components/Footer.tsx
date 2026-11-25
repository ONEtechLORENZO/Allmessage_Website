import Link from "next/link";
import type { Dictionary } from "@milo/lib/dictionaries";
import { localePath, site, type Locale } from "@milo/lib/site";
import { HeaderLogo } from "./HeaderLogo";
import { OneTechBy } from "./OneTechBy";
import "./footer.css";

// Decorative 3D boxes in the middle of the footer card: [left, top, width, height, colour] in px of a
// 500 × 315 picture (turned into percentages, so the picture can shrink to the space it has).
const BOXES: [number, number, number, number, string][] = [
  [2, 48, 103, 54, "w"], [105, 0, 108, 102, "p"], [105, 102, 108, 98, "g"], [213, 102, 117, 108, "w"],
  [75, 200, 140, 115, "w"], [217, 212, 113, 103, "t"], [330, 217, 100, 98, "p"], [435, 275, 58, 40, "t"],
];

// Same blocks as the header tabs.
const SECTIONS = ["audience", "differentiators", "capabilities", "platform", "about"] as const;

// Footer card: big logo | 3D boxes | page sections + office address.
export function Footer({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const f = dict.footer;
  return (
    <footer className="ft">
      <div className="ft-card">
        <div className="ft-brand">
          <Link href={`${localePath(lang)}#intro`} className="ft-logo" aria-label={`${site.name} – ${dict.nav.home}`}>
            <HeaderLogo />
          </Link>
          <OneTechBy label={dict.nav.by} className="otby-foot" />
        </div>

        <div className="ft-art" aria-hidden="true">
          {BOXES.map(([x, y, w, h, c], i) => (
            <span key={i} className={`ft-box ft-${c}`} style={{ left: `${(x / 5).toFixed(2)}%`, top: `${((y / 315) * 100).toFixed(2)}%`, width: `${(w / 5).toFixed(2)}%`, height: `${((h / 315) * 100).toFixed(2)}%`, "--i": i } as React.CSSProperties} />
          ))}
        </div>

        <nav className="ft-cols" aria-label={f.nav}>
          <div className="ft-col">
            <h2 className="ft-head">{site.name}</h2>
            <ul>
              {SECTIONS.map((id) => (
                <li key={id}><Link href={`${localePath(lang)}#${id}`} className="ft-link">{dict.nav.tabs[id]}</Link></li>
              ))}
            </ul>
          </div>
          <div className="ft-col">
            <h2 className="ft-head">{f.offices}</h2>
            <address className="ft-addr">
              {site.officeLines.map((l) => <span key={l}>{l}</span>)}
              <a href={`mailto:${site.company.email}`} className="ft-mail">{site.company.email}</a>
            </address>
          </div>
        </nav>
      </div>
    </footer>
  );
}
