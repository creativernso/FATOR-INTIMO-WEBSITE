import CommunityProvider from '@/components/community/CommunityProvider';

export default function CommunidadeLayout({ children }: { children: React.ReactNode }) {
  return (
    <CommunityProvider>
      {children}
    </CommunityProvider>
  );
}
