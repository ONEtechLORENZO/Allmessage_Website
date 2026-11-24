import { readFileSync } from "node:fs";
import path from "node:path";
import { demoKitFor } from "../../_home/markup";

// Files for product pages (e.g. Milo) that show the same WhatsApp button and "Richiedi Demo" form
// as the homepage. Built from the homepage itself, so they never drift apart:
//   /demo-kit/it.html, /demo-kit/en.html  the button + form markup
//   /demo-kit/demo.css                    only the styles they need
// The behaviour is in public/js/demo-kit.js.
export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() {
  return ["it.html", "en.html", "demo.css"].map((file) => ({ file }));
}

export async function GET(_request, { params }) {
  const { file } = await params;
  if (file === "demo.css") return new Response(kitCss(), { headers: { "Content-Type": "text/css; charset=utf-8" } });
  const lang = file === "en.html" ? "en" : "it";
  return new Response(demoKitFor(lang), { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

// Rules of the homepage CSS that style the form, the WhatsApp button, the swallow and the button effects.
const KIT = /demo|wa-|swallow|ripple|magnetic/;

function kitCss() {
  const css = readFileSync(path.join(process.cwd(), "app", "globals.css"), "utf8");
  const blocks = topLevelBlocks(css);
  const out = [];
  const keyframes = new Map();
  for (const b of blocks) {
    const name = b.selector.match(/^@keyframes\s+([\w-]+)/)?.[1];
    if (name) keyframes.set(name, b.text);
  }
  for (const b of blocks) {
    const sel = b.selector.replace(/\/\*[\s\S]*?\*\//g, "").trim();
    if (sel.startsWith("@font-face")) out.push(b.text);
    else if (sel.startsWith("@media") || sel.startsWith("@supports")) {
      const inner = topLevelBlocks(b.body).filter((r) => KIT.test(r.selector)).map((r) => "  " + r.text.trim());
      if (inner.length) out.push(`${sel} {\n${inner.join("\n")}\n}`);
    } else if (!sel.startsWith("@") && KIT.test(sel)) out.push(b.text.trim());
  }
  let rules = out.join("\n");
  const used = [...keyframes.keys()].filter((n) => new RegExp(`\\b${n}\\b`).test(rules));
  rules += "\n" + used.map((n) => keyframes.get(n).trim()).join("\n");

  // Base styles the homepage gives every element (scoped, so the host page is not affected).
  const base = `/* AllMessage demo kit (generated from app/globals.css) */
:where(#demo-kit) { --blue: #308bea; --ink: #474747; --line: #e9e9e9; }
:where(#demo-kit) .demo-modal, :where(#demo-kit) .wa-float { font-family: Sora, sans-serif; font-weight: 400; font-size: 16px; line-height: normal; color: var(--ink); -webkit-font-smoothing: antialiased; text-align: left; }
:where(#demo-kit) *, :where(#demo-kit) *::before, :where(#demo-kit) *::after { box-sizing: border-box; }
:where(#demo-kit) a { color: inherit; text-decoration: none; }
:where(#demo-kit) a:focus-visible, :where(#demo-kit) button:focus-visible { outline: 2px solid var(--blue); outline-offset: 6px; }
:where(#demo-kit) [hidden] { display: none !important; }
:where(#demo-kit) h2, :where(#demo-kit) h3 { font-size: revert; font-weight: revert; margin: revert; }
:where(#demo-kit) p { margin: revert; }
:where(#demo-kit) svg, :where(#demo-kit) img { display: inline; }
`;
  return base + rules + "\n";
}

// Splits CSS into top-level { selector, body, text } blocks.
function topLevelBlocks(css) {
  const blocks = [];
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf("{", i);
    if (open < 0) break;
    let depth = 0, k = open;
    for (; k < css.length; k++) {
      if (css[k] === "{") depth++;
      else if (css[k] === "}" && --depth === 0) break;
    }
    const selector = css.slice(i, open).trim();
    blocks.push({ selector, body: css.slice(open + 1, k), text: css.slice(i, k + 1).replace(/^\s*(\/\*[\s\S]*?\*\/\s*)*/, "") });
    i = k + 1;
  }
  return blocks;
}
