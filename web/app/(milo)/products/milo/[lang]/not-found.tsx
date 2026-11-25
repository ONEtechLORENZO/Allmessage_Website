import Link from "next/link";
import { lang as langParam } from "next/root-params";
import { getDictionary } from "@milo/lib/dictionaries";
import { defaultLocale, hasLocale, localePath } from "@milo/lib/site";

export default async function NotFound() {
  const value = await langParam();
  const lang = hasLocale(value) ? value : defaultLocale;
  const { notFound: t } = await getDictionary(lang);
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <p className="text-sm font-semibold text-brand">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{t.title}</h1>
      <p className="mt-4 text-muted">{t.text}</p>
      <Link href={localePath(lang)} className="mt-8 inline-block rounded-lg bg-brand px-5 py-3 font-semibold text-brand-contrast hover:bg-brand-strong">
        {t.back}
      </Link>
    </div>
  );
}
