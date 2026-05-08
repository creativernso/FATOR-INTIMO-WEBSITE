export const COMMUNITY_CATEGORIES = [
  { slug: 'relacionamentos', label: 'Relacionamentos', icon: '♡', description: 'Dinâmicas, padrões e conexões afetivas' },
  { slug: 'apego-emocional', label: 'Apego emocional', icon: '⬡', description: 'Estilos de apego e vínculos afetivos' },
  { slug: 'terminos', label: 'Términos', icon: '◈', description: 'Luto, separação e recomeços' },
  { slug: 'masculino-feminino', label: 'Masculino & Feminino', icon: '⊕', description: 'Polaridades, diferenças e equilíbrio' },
  { slug: 'autoconhecimento', label: 'Autoconhecimento', icon: '◎', description: 'Padrões internos e consciência própria' },
  { slug: 'ansiedade-emocional', label: 'Ansiedade emocional', icon: '∿', description: 'Gestão emocional e tranquilidade interior' },
  { slug: 'comunicacao', label: 'Comunicação', icon: '◉', description: 'Expressão, escuta e linguagem emocional' },
  { slug: 'amor-moderno', label: 'Amor moderno', icon: '◇', description: 'Relacionamentos na era digital' },
  { slug: 'historias-reais', label: 'Histórias reais', icon: '◑', description: 'Experiências vividas com profundidade' },
  { slug: 'cura-emocional', label: 'Cura emocional', icon: '☽', description: 'Processos de cura e regeneração afetiva' },
] as const;

export type CategorySlug = (typeof COMMUNITY_CATEGORIES)[number]['slug'];

export function getCategoryBySlug(slug: string) {
  return COMMUNITY_CATEGORIES.find((c) => c.slug === slug) ?? null;
}

export const ROLE_LABELS: Record<string, string> = {
  founder: 'Rafael Moreira',
  moderator: 'Moderador',
  user: '',
};
