import localFont from 'next/font/local';
import Swallow from '@/components/Swallow';
import { METADATA_BASE, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from '@/lib/site';
import './globals.css';

const sora = localFont({
  src: './fonts/Sora.ttf',
  weight: '100 800',
  style: 'normal',
  display: 'swap',
  variable: '--font-sora',
});

export const metadata = {
  metadataBase: METADATA_BASE,
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  // Absolute URLs only once the real domain is known (SITE_URL).
  ...(SITE_URL && { alternates: { canonical: '/' } }),
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    ...(SITE_URL && { url: '/' }),
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

export default function RootLayout({ children }) {
  return (
    <html lang="it" className={sora.variable}>
      <body>
        {children}
        <Swallow />
      </body>
    </html>
  );
}
