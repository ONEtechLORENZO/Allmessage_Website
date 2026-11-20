import { readFileSync } from "node:fs";
import path from "node:path";
import en from "../i18n/en.json";

// The homepage markup lives in app/home-markup.html (Italian, the original).
// The English page is the same markup with every text swapped using app/i18n/en.json.
export const italian = readFileSync(path.join(process.cwd(), "app", "home-markup.html"), "utf8");
export const english = toEnglish(italian);

export const markupFor = (lang) => (lang === "en" ? english : italian);

/** The WhatsApp button + "Richiedi Demo" form (end of the homepage), for product pages like Milo. */
export function demoKitFor(lang) {
  const html = markupFor(lang);
  const start = html.indexOf('<a class="wa-float"');
  if (start < 0) throw new Error('demo kit: <a class="wa-float"> not found in home-markup.html');
  return html.slice(start);
}

function toEnglish(markup) {
  const used = new Set();
  const swap = (key, dict) => {
    if (!Object.hasOwn(dict, key)) return null;
    used.add(key);
    return dict[key];
  };

  // Text between tags (whitespace around the text is kept)
  let out = markup.replace(/>([^<]+)</g, (m, raw) => {
    const t = swap(raw.trim().replace(/\s+/g, " "), en.text);
    if (t === null) return m;
    return ">" + raw.match(/^\s*/)[0] + t + raw.match(/\s*$/)[0] + "<";
  });
  // Labels for screen readers, image descriptions, plan periods, form step titles
  out = out.replace(/\b(aria-label|alt|placeholder|data-title|data-monthly|data-annual)="([^"]*)"/g, (m, attr, value) => {
    const t = swap(value, en.attr);
    return t === null ? m : `${attr}="${t}"`;
  });

  // Links: Milo in English, and the language switch marks EN as the current language
  out = replaceAll(out, 'href="/products/milo/"', 'href="/products/milo/en/"');
  out = replaceAll(out, 'hreflang="it" aria-current="true">IT</a>', 'hreflang="it">IT</a>');
  out = replaceAll(out, 'hreflang="en">EN</a>', 'hreflang="en" aria-current="true">EN</a>');

  // A text in en.json that no longer matches the page means the Italian text was edited:
  // stop the build so the English page never silently shows Italian.
  const stale = [...Object.keys(en.text), ...Object.keys(en.attr)].filter((k) => !used.has(k));
  if (stale.length) throw new Error("app/i18n/en.json has texts not found in home-markup.html:\n  " + stale.join("\n  "));
  return out;
}

function replaceAll(s, from, to) {
  if (!s.includes(from)) throw new Error(`English page: "${from}" not found in home-markup.html`);
  return s.split(from).join(to);
}
