import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import SitePopup from '@/components/SitePopup';
import CookieConsent from '@/components/CookieConsent';
import { PageViewTracker } from '@/components/PageViewTracker';
import { MetaPixel } from '@/components/MetaPixel';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MetaPixel />
      <PageViewTracker />
      <Navbar />
      <main>{children}</main>
      <Footer />
      <WhatsAppButton />
      <SitePopup />
      <CookieConsent />
    </>
  );
}
