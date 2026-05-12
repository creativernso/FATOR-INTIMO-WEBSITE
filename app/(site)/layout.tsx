import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LiveChat from '@/components/LiveChat';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <LiveChat />
    </>
  );
}
