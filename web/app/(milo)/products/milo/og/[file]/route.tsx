import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { getDictionary } from "@milo/lib/dictionaries";
import { hasLocale, locales, site } from "@milo/lib/site";

// Image shown when a Milo page is shared on social networks and messaging apps:
// /products/milo/og/it.png and /products/milo/og/en.png (linked by ogImage() in milo/lib/site.ts).
// An address ending in ".png" is served as it is, with no trailing-slash redirect.
const size = { width: 1200, height: 630 };

export const dynamicParams = false;
export function generateStaticParams() {
  return locales.map((lang) => ({ file: `${lang}.png` }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const lang = file.replace(/\.png$/, "");
  if (!hasLocale(lang)) notFound();
  const { meta } = await getDictionary(lang);
  // Same words as the page title and description: "Milo | <headline> | One Tech"
  const headline = meta.title.split(" | ")[1] ?? meta.title;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #079e9a 0%, #04282b 100%)",
          color: "white",
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 700, opacity: 0.85 }}>{site.name}</div>
        <div style={{ fontSize: 64, fontWeight: 800, marginTop: 24, lineHeight: 1.1 }}>{headline}</div>
        <div style={{ fontSize: 30, marginTop: 28, opacity: 0.85 }}>{meta.description}</div>
      </div>
    ),
    size,
  );
}
