import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LiveChat from '@/components/LiveChat';
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
      <LiveChat />
    </>
  );
}
