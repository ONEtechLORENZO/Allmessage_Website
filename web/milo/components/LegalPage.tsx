import { site } from "@milo/lib/site";
import type { Locale } from "@milo/lib/site";

type Section = { h: string; p: string };

// Fills placeholders like {legalName} with the values from src/lib/site.ts.
const fill = (text: string) =>
  text.replace(/\{(\w+)\}/g, (m, key: string) =>
    key in site.company ? site.company[key as keyof typeof site.company] : m,
  );

export function LegalPage({
  lang,
  title,
  updatedLabel,
  sections,
}: {
  lang: Locale;
  title: string;
  updatedLabel: string;
  sections: Section[];
}) {
  const date = new Intl.DateTimeFormat(lang, { dateStyle: "long" }).format(new Date(site.legalUpdated));
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-3 text-sm text-muted">
        {updatedLabel}: <time dateTime={site.legalUpdated}>{date}</time>
      </p>
      {sections.map((s) => (
        <section key={s.h} className="mt-10">
          <h2 className="text-xl font-semibold">{s.h}</h2>
          <p className="mt-3 leading-relaxed text-muted">{fill(s.p)}</p>
        </section>
      ))}
    </article>
  );
}
