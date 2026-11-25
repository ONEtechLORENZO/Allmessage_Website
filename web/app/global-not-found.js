import "./globals.css";

// Shown for addresses that match no page (the site has two root layouts: Italian and English).
export const metadata = {
  title: "404 – Pagina non trovata / Page not found",
  robots: { index: false, follow: false },
  icons: { icon: { url: "/icon.png", type: "image/png" } },
};

export default function GlobalNotFound() {
  return (
    <html lang="it">
      <body>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", textAlign: "center", padding: 24 }}>
          <div>
            <p style={{ color: "#2f8be5", fontWeight: 600 }}>404</p>
            <h1 style={{ margin: "8px 0" }}>Pagina non trovata</h1>
            <p lang="en" style={{ color: "#6b7280" }}>Page not found</p>
            <p style={{ marginTop: 28, display: "flex", gap: 12, justifyContent: "center" }}>
              <a className="demo-btn" href="/">Home (IT)</a>
              <a className="demo-btn" href="/en/" lang="en">Home (EN)</a>
            </p>
          </div>
        </main>
      </body>
    </html>
  );
}
