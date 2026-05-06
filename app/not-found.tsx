import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="font-heading text-8xl font-light text-accent/20 mb-4">404</p>
      <h1 className="font-heading text-3xl font-light text-text-primary mb-3">
        Página não encontrada
      </h1>
      <p className="text-text-secondary text-sm mb-8 max-w-xs leading-relaxed">
        A página que você procura não existe ou foi removida.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm border border-white/10 hover:border-white/20 px-6 py-3 rounded-full text-text-secondary hover:text-text-primary transition-all"
      >
        <ArrowLeft size={14} /> Voltar ao início
      </Link>
    </div>
  );
}
