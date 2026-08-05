import type { Metadata } from 'next';
import UnsubscribeForm from './UnsubscribeForm';

// Reached only via a link in an email, never worth indexing.
export const metadata: Metadata = {
  title: 'Cancelar inscrição',
  description: 'Cancele sua inscrição para receber emails do Fator Íntimo.',
  robots: { index: false, follow: false, nocache: true },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-28">
      <div className="w-full max-w-md rounded-2xl border border-white/8 bg-surface p-10">
        <UnsubscribeForm initialEmail={email || ''} />
      </div>
    </div>
  );
}
