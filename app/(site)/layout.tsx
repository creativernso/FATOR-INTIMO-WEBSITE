import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import SitePopup from '@/components/SitePopup';
import CookieConsent from '@/components/CookieConsent';
import { PageViewTracker } from '@/components/PageViewTracker';
import { MetaPixel } from '@/components/MetaPixel';
import { TikTokPixel } from '@/components/TikTokPixel';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MetaPixel />
      <TikTokPixel />
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
