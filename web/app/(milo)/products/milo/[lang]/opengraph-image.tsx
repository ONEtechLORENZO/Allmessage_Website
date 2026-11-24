import { ImageResponse } from "next/og";
import { getDictionary } from "@milo/lib/dictionaries";
import { defaultLocale, hasLocale, site } from "@milo/lib/site";

// Image shown when the page is shared on social networks and messaging apps.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = site.name;

export default async function OpenGraphImage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(hasLocale(lang) ? lang : defaultLocale);
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
        <div style={{ fontSize: 68, fontWeight: 800, marginTop: 24, lineHeight: 1.1 }}>{dict.hero.title}</div>
        <div style={{ fontSize: 30, marginTop: 28, opacity: 0.85 }}>{dict.hero.subtitle}</div>
      </div>
    ),
    size,
  );
}
