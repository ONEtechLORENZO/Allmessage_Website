import "server-only";
import type { Locale } from "./site";
import type en from "@milo/dictionaries/en.json";

export type Dictionary = typeof en;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  it: () => import("@milo/dictionaries/it.json").then((m) => m.default),
  en: () => import("@milo/dictionaries/en.json").then((m) => m.default),
};

export const getDictionary = (locale: Locale) => dictionaries[locale]();
