import { DemoProvider } from '@/components/demo/DemoProvider';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Plans from '@/components/Plans';
import About from '@/components/About';
import Integrations from '@/components/Integrations';
import Footer from '@/components/Footer';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';

// Structured data for search engines. Everything here is taken from the page itself (footer, copy).
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://www.otech.one/#organization',
      name: 'One Tech',
      url: 'https://www.otech.one/',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Via Gustavo Fara 32',
        postalCode: '20124',
        addressLocality: 'Milano',
        addressRegion: 'MI',
        addressCountry: 'IT',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'sales',
        email: 'sales@otech.one',
        availableLanguage: 'it',
      },
      sameAs: ['https://www.linkedin.com/company/otech-one/', 'https://www.instagram.com/onetech.one'],
    },
    {
      '@type': 'SoftwareApplication',
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      inLanguage: 'it',
      publisher: { '@id': 'https://www.otech.one/#organization' },
      ...(SITE_URL && { url: `${SITE_URL}/` }),
    },
  ],
};

export default function Home() {
  return (
    <DemoProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <a className="skip-link" href="#contenuto">Vai al contenuto</a>
      <Header />
      <main id="contenuto">
        <Hero />
        <HowItWorks />
        <Plans />
        <About />
        <Integrations />
      </main>
      <Footer />
    </DemoProvider>
  );
}
