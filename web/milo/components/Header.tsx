import Link from "next/link";
import type { Dictionary } from "@milo/lib/dictionaries";
import { localePath, site, type Locale } from "@milo/lib/site";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { SectionTabs } from "./SectionTabs";
import { HeaderLogo } from "./HeaderLogo";
import { OneTechBy } from "./OneTechBy";

export function Header({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const home = localePath(lang);
  const t = dict.nav.tabs;
  // ids match the sections on the home page
  const tabs = [
    { id: "audience", label: t.audience },
    { id: "differentiators", label: t.differentiators },
    { id: "capabilities", label: t.capabilities },
    { id: "platform", label: t.platform },
    { id: "about", label: t.about },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      {/* same arrangement as the AllMessage header: full width, logo left | tabs centred | language right */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-6 px-[clamp(24px,4vw,80px)] md:h-[83px] max-md:grid-rows-[3.5rem_auto] max-md:gap-x-4 max-md:px-4">
        {/* the logo always takes you back to the first block */}
        <div className="flex items-end gap-3 justify-self-start">
          <Link href={`${home}#intro`} className="flex items-center py-1" aria-label={`${site.name} – ${dict.nav.home}`}>
            <HeaderLogo />
          </Link>
          <OneTechBy label={dict.nav.by} className="otby-head" />
        </div>
        {/* phones: the tabs get their own row under the logo */}
        <div className="flex min-w-0 justify-center max-md:col-span-3 max-md:row-start-2 max-md:justify-start max-md:pb-2">
          <SectionTabs tabs={tabs} label={t.label} home={home} />
        </div>
        <div className="col-start-3 row-start-1 flex items-center gap-[clamp(12px,1.6vw,22px)] justify-self-end">
          <LanguageSwitcher lang={lang} label={dict.nav.language} />
        </div>
      </div>
    </header>
  );
}
