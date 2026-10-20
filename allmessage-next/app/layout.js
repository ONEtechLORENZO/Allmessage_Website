import localFont from 'next/font/local';
import Swallow from '@/components/Swallow';
import './globals.css';

const sora = localFont({
  src: './fonts/Sora.ttf',
  weight: '100 800',
  style: 'normal',
  display: 'swap',
  variable: '--font-sora',
});

export const metadata = {
  title: 'AllMessage — Tutte le conversazioni, un unico posto',
  description: 'AllMessage riunisce le conversazioni della tua azienda. Gestisci messaggi, automazioni e integrazioni in un unico posto.',
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
