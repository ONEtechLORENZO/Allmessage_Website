import Script from "next/script";
import { markupFor } from "./markup";
import { keepPlaceScript } from "./keepPlace";

// Homepage: static markup (app/home-markup.html, English via app/i18n/en.json).
// public/js/site.js runs the animations, slider and plans toggle;
// public/js/demo-kit.js runs the "Richiedi Demo" form and the WhatsApp button (shared with Milo).
export default function Home({ lang }) {
  return (
    <>
      <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: markupFor(lang) }} />
      <script dangerouslySetInnerHTML={{ __html: keepPlaceScript }} />
      <Script src="/js/site.js" strategy="afterInteractive" />
      <Script src="/js/demo-kit.js" strategy="afterInteractive" />
    </>
  );
}
