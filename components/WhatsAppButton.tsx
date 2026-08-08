const WHATSAPP_NUMBER = '5541996366145';
const DEFAULT_MESSAGE = 'Olá! Tenho uma dúvida sobre o Fator Íntimo.';

export default function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-xl shadow-black/30 hover:scale-105 active:scale-95 transition-all"
    >
      <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.92 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.24 0 4.35.87 5.94 2.46a8.3 8.3 0 0 1 2.45 5.92c0 4.61-3.75 8.36-8.4 8.36h-.01a8.3 8.3 0 0 1-4.24-1.16l-.3-.18-3.12.82.83-3.04-.2-.31a8.24 8.24 0 0 1-1.28-4.46c0-4.61 3.76-8.36 8.36-8.36Zm4.63 11.94c-.23-.12-1.35-.66-1.56-.74-.21-.08-.36-.12-.51.12-.15.23-.59.74-.72.9-.13.15-.27.17-.5.06-.23-.12-.97-.36-1.85-1.14-.68-.61-1.15-1.36-1.28-1.59-.13-.23-.01-.35.1-.47.11-.11.23-.27.35-.4.12-.14.15-.23.23-.39.08-.15.04-.29-.02-.41-.06-.12-.51-1.23-.7-1.68-.19-.44-.37-.38-.51-.39l-.44-.01c-.15 0-.4.06-.6.29-.21.23-.79.77-.79 1.87s.81 2.17.92 2.32c.12.15 1.6 2.44 3.87 3.42.54.23.96.37 1.29.48.54.17 1.03.15 1.42.09.43-.06 1.35-.55 1.54-1.09.19-.53.19-.98.13-1.08-.06-.09-.21-.15-.44-.26Z" />
      </svg>
    </a>
  );
}
