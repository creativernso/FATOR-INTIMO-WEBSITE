import { getCategoryBySlug } from '@/lib/community';

interface Props {
  slug: string;
  size?: 'sm' | 'md';
}

export default function CategoryBadge({ slug, size = 'sm' }: Props) {
  const cat = getCategoryBySlug(slug);
  if (!cat) return null;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/4 text-text-muted font-medium ${
      size === 'md' ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-[11px]'
    }`}>
      <span className="opacity-70">{cat.icon}</span>
      {cat.label}
    </span>
  );
}
