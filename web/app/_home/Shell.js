import "../globals.css";
import head from "../head.json";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: head.theme,
};

// <html> and <body> shared by the Italian (/) and English (/en/) pages.
export default function Shell({ lang, children }) {
  return (
    <html lang={lang}>
      <head>
        <link rel="preload" href="/fonts/Sora.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
