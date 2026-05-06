import fs from 'fs';
import path from 'path';
import { Post, Product, Testimonial, Lead } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readFile<T>(filename: string, fallback: T[]): T[] {
  ensureDir();
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2));
    return fallback;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeFile<T>(filename: string, data: T[]): void {
  ensureDir();
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
}

// Posts
export const getPosts = (): Post[] => readFile<Post>('posts.json', defaultPosts);
export const savePosts = (posts: Post[]) => writeFile('posts.json', posts);

// Products
export const getProducts = (): Product[] => readFile<Product>('products.json', defaultProducts);
export const saveProducts = (products: Product[]) => writeFile('products.json', products);

// Testimonials
export const getTestimonials = (): Testimonial[] => readFile<Testimonial>('testimonials.json', defaultTestimonials);
export const saveTestimonials = (testimonials: Testimonial[]) => writeFile('testimonials.json', testimonials);

// Leads
export const getLeads = (): Lead[] => readFile<Lead>('leads.json', []);
export const saveLeads = (leads: Lead[]) => writeFile('leads.json', leads);

// --- Default seed data ---

const defaultPosts: Post[] = [
  {
    id: '1',
    title: 'Por que pessoas inteligentes tomam decisões péssimas no amor',
    slug: 'pessoas-inteligentes-decisoes-pessimas-amor',
    excerpt: 'A inteligência racional não garante escolhas emocionais saudáveis. Entenda o paradoxo que sabota os relacionamentos de pessoas brilhantes.',
    content: `<p>Há uma crença comum de que pessoas inteligentes tomam melhores decisões em todas as áreas da vida. Mas quando se trata de relacionamentos, essa premissa frequentemente se desfaz.</p>
    <p>O problema não é a inteligência em si — é que o cérebro racional e o cérebro emocional operam em frequências completamente diferentes. E em momentos de apego intenso, o sistema límbico assume o controle.</p>
    <h2>O paradoxo da racionalização emocional</h2>
    <p>Pessoas altamente inteligentes têm uma capacidade extraordinária de racionalizar comportamentos disfuncionais. Elas constroem narrativas elaboradas para justificar por que continuam em relacionamentos que as prejudicam.</p>
    <p>Essa capacidade de construir argumentos sofisticados se volta contra elas — criando prisões mentais elegantes mas sufocantes.</p>
    <h2>A solução não é pensar menos</h2>
    <p>A saída não está em "desligar" o cérebro racional, mas em desenvolver inteligência emocional que trabalhe em harmonia com ele. Isso significa reconhecer padrões de apego, entender gatilhos emocionais e construir uma relação honesta consigo mesmo.</p>`,
    category: 'Psicologia',
    coverImage: 'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=800&q=80',
    publishedAt: '2024-01-15',
    readTime: 7,
    featured: true,
  },
  {
    id: '2',
    title: 'O silêncio como estratégia: quando calar fala mais alto',
    slug: 'silencio-como-estrategia-relacionamentos',
    excerpt: 'O silêncio estratégico é uma das ferramentas mais poderosas em relacionamentos. Aprenda quando e como usá-lo sem jogos ou manipulação.',
    content: `<p>Em uma cultura que valoriza a comunicação constante, o silêncio se tornou quase um tabu. Mas os comunicadores mais eficazes entendem que o que não se diz pode ser tão poderoso quanto o que se diz.</p>
    <p>Existe uma diferença crucial entre o silêncio reativo — aquele que vem da raiva ou da insegurança — e o silêncio estratégico, que vem da consciência e da força interior.</p>
    <h2>Silêncio reativo vs. silêncio intencional</h2>
    <p>O silêncio reativo é uma punição disfarçada. O silêncio intencional é uma afirmação de valor próprio. Um vem do medo, o outro vem da clareza.</p>`,
    category: 'Comunicação',
    coverImage: 'https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?w=800&q=80',
    publishedAt: '2024-01-22',
    readTime: 5,
    featured: true,
  },
  {
    id: '3',
    title: 'Teoria do apego: como sua infância molda seus relacionamentos hoje',
    slug: 'teoria-apego-infancia-relacionamentos',
    excerpt: 'Os padrões formados nos primeiros anos de vida definem como nos relacionamos décadas depois. Entenda e transforme seus estilos de apego.',
    content: `<p>John Bowlby desenvolveu a teoria do apego na década de 1960, mas sua relevância nunca foi tão urgente quanto hoje. Os padrões de apego formados na infância funcionam como um script inconsciente que dirige nossos relacionamentos adultos.</p>
    <p>Existem quatro estilos principais de apego: seguro, ansioso, evitativo e desorganizado. A maioria das pessoas se identifica predominantemente com um deles.</p>
    <h2>Apego ansioso</h2>
    <p>Pessoas com apego ansioso constantemente buscam validação e têm medo intenso de abandono. Elas frequentemente sabotam relacionamentos saudáveis por não conseguirem tolerar a incerteza natural de qualquer conexão humana.</p>
    <h2>Apego evitativo</h2>
    <p>O estilo evitativo se manifesta como uma necessidade excessiva de independência e dificuldade com intimidade emocional. Por trás da aparente autossuficiência, há frequentemente uma ferida de rejeição não processada.</p>`,
    category: 'Psicologia',
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    publishedAt: '2024-02-01',
    readTime: 9,
    featured: false,
  },
];

const defaultProducts: Product[] = [
  {
    id: '1',
    title: 'Fator Atração',
    hook: 'O mapa psicológico que faz alguém pensar em você o tempo todo',
    description: 'Descubra os mecanismos neurológicos da atração e como ativá-los de forma autêntica. Não se trata de técnicas — é sobre entender como a mente funciona.',
    price: 47,
    originalPrice: 97,
    coverImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
    checkoutUrl: '#',
    featured: true,
    category: 'Atração',
    tags: ['atração', 'psicologia', 'relacionamentos'],
  },
  {
    id: '2',
    title: 'Código da Intimidade',
    hook: 'Como criar conexões profundas sem perder sua essência',
    description: 'Um guia completo sobre vulnerabilidade estratégica, comunicação não-violenta e os fundamentos de relacionamentos que realmente duram.',
    price: 67,
    originalPrice: 127,
    coverImage: 'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=600&q=80',
    checkoutUrl: '#',
    featured: true,
    category: 'Intimidade',
    tags: ['intimidade', 'comunicação', 'conexão'],
  },
  {
    id: '3',
    title: 'Blindagem Emocional',
    hook: 'Pare de se destruir por pessoas que não valem',
    description: 'Um programa de desintoxicação emocional. Aprenda a reconhecer relacionamentos tóxicos, recuperar seu valor próprio e construir limites saudáveis.',
    price: 57,
    coverImage: 'https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?w=600&q=80',
    checkoutUrl: '#',
    featured: false,
    category: 'Autoconhecimento',
    tags: ['autoestima', 'limites', 'recuperação'],
  },
];

const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Mariana Costa',
    role: 'Designer, 29 anos',
    content: 'Eu vivia em um ciclo de relacionamentos onde sempre me sentia menos. Depois de aplicar os conceitos do Fator Atração, entendi que o problema não era eu — era o padrão que eu estava repetindo inconscientemente.',
    transformation: 'Saí de um relacionamento de 3 anos que me diminuía e hoje estou em uma conexão que me expande.',
    rating: 5,
    productPurchased: 'Fator Atração',
  },
  {
    id: '2',
    name: 'Ricardo Alves',
    role: 'Empresário, 34 anos',
    content: 'Sou uma pessoa muito racional e sempre achei que "essas coisas de psicologia" não eram para mim. O Rafael tem uma forma de explicar que conecta com quem pensa assim. Transformador.',
    transformation: 'Aprendi a me comunicar de forma mais eficaz com minha parceira sem perder minha autenticidade.',
    rating: 5,
    productPurchased: 'Código da Intimidade',
  },
  {
    id: '3',
    name: 'Fernanda Lima',
    role: 'Psicóloga, 31 anos',
    content: 'Como profissional da área, fiquei impressionada com a profundidade e a acessibilidade do conteúdo. Rafael traduz conceitos complexos de forma elegante e prática.',
    transformation: 'Recomendo para meus próprios clientes como material complementar.',
    rating: 5,
    productPurchased: 'Blindagem Emocional',
  },
  {
    id: '4',
    name: 'Lucas Mendes',
    role: 'Engenheiro, 27 anos',
    content: 'Sempre fui o cara que "fugia" das conversas difíceis. O Código da Intimidade me deu um framework concreto para lidar com emoções — algo que eu nunca tive acesso antes.',
    transformation: 'Hoje consigo ter conversas reais com pessoas que importam para mim.',
    rating: 5,
    productPurchased: 'Código da Intimidade',
  },
];
