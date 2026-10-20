import { DemoProvider } from '@/components/demo/DemoProvider';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Plans from '@/components/Plans';
import About from '@/components/About';
import Integrations from '@/components/Integrations';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <DemoProvider>
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
