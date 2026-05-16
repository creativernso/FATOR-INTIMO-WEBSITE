import type { Metadata } from 'next';
import LegalPage, { P, UL, LI, H3, Strong } from '@/components/legal/LegalPage';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Política de Cookies',
  description:
    'Quais cookies o Fator Íntimo utiliza, por quê, e como você pode gerenciar suas preferências.',
  path: '/legal/cookies',
  keywords: ['cookies fator íntimo', 'política de cookies', 'rastreamento web'],
});

const LAST_UPDATED = '15 de maio de 2026';

const sections = [
  {
    id: 'o-que-sao',
    title: 'O que são cookies',
    body: (
      <>
        <P>
          Cookies são pequenos arquivos de texto que sites colocam no seu navegador para lembrar
          preferências, manter sessões abertas, entender padrões de uso e melhorar a experiência. Eles
          podem ser de sessão (apagados quando você fecha o navegador) ou persistentes (com prazo
          definido).
        </P>
        <P>
          Também utilizamos tecnologias similares, como pixels, web beacons, armazenamento local e
          identificadores anônimos, para finalidades comparáveis. Por simplicidade, chamamos todas elas
          de “cookies” nesta política.
        </P>
      </>
    ),
  },
  {
    id: 'por-que-usamos',
    title: 'Por que utilizamos',
    body: (
      <>
        <P>Cookies cumprem funções essenciais para a operação do Fator Íntimo:</P>
        <UL>
          <LI>Manter sua sessão ativa após o login.</LI>
          <LI>Lembrar preferências como tema, idioma e estado de leitura.</LI>
          <LI>Proteger contra fraudes, bots e acessos suspeitos.</LI>
          <LI>Medir o desempenho editorial e identificar pontos de melhoria.</LI>
          <LI>Personalizar recomendações de conteúdo e ofertas relevantes.</LI>
          <LI>Atribuir corretamente conversões em campanhas de marketing.</LI>
        </UL>
      </>
    ),
  },
  {
    id: 'categorias',
    title: 'Categorias de cookies',
    body: (
      <>
        <H3>Estritamente necessários</H3>
        <P>
          Indispensáveis para o funcionamento da Plataforma, autenticação, segurança, carrinho de
          compras, sessões e preferências básicas. Não podem ser desativados sem comprometer recursos
          essenciais.
        </P>
        <H3>Funcionais</H3>
        <P>
          Lembram escolhas que você fez para tornar a experiência mais agradável: idioma, tema escuro/claro,
          progresso de leitura e preferências da comunidade.
        </P>
        <H3>Analíticos</H3>
        <P>
          Coletam métricas de uso de forma agregada e, sempre que possível, anonimizada. Usamos
          ferramentas como Google Analytics e instrumentação interna para entender quais conteúdos têm
          maior impacto e onde melhorar.
        </P>
        <H3>Marketing</H3>
        <P>
          Permitem medir a eficácia de campanhas e mostrar conteúdo relevante em outras plataformas.
          Quando aplicável, utilizamos Meta Pixel e identificadores publicitários, sempre respeitando
          consentimento e preferências.
        </P>
      </>
    ),
  },
  {
    id: 'terceiros',
    title: 'Cookies de terceiros',
    body: (
      <>
        <P>
          Alguns cookies são definidos por serviços parceiros que tornam o Fator Íntimo possível:
        </P>
        <UL>
          <LI><Strong>Stripe</Strong>, segurança e antifraude em pagamentos.</LI>
          <LI><Strong>Google Analytics</Strong>, análise agregada de uso.</LI>
          <LI><Strong>Meta Pixel (Facebook/Instagram)</Strong>, métricas de campanhas.</LI>
          <LI><Strong>YouTube/Vimeo</Strong>, quando vídeos são embutidos no site.</LI>
          <LI><Strong>Firebase/Google Cloud</Strong>, infraestrutura e autenticação.</LI>
        </UL>
        <P>
          Esses provedores possuem políticas próprias e seguem padrões de proteção compatíveis com LGPD e
          GDPR. Eles tratam dados sob nossa orientação para os fins descritos.
        </P>
      </>
    ),
  },
  {
    id: 'consentimento',
    title: 'Consentimento e gestão',
    body: (
      <>
        <P>
          Cookies estritamente necessários funcionam por padrão. Para as demais categorias, respeitamos a
          base legal aplicável e oferecemos meios para que você gerencie sua preferência:
        </P>
        <UL>
          <LI>
            <Strong>Banner de consentimento:</Strong> exibido em sua primeira visita, com opções claras
            de aceitar ou recusar categorias opcionais.
          </LI>
          <LI>
            <Strong>Configurações do navegador:</Strong> qualquer navegador moderno permite bloquear ou
            limpar cookies. Consulte as instruções específicas do seu navegador (Chrome, Safari, Firefox,
            Edge, Brave).
          </LI>
          <LI>
            <Strong>Sinais globais:</Strong> respeitamos cabeçalhos como{' '}
            <Strong>Global Privacy Control</Strong> e <Strong>Do Not Track</Strong>, sempre que
            tecnicamente viáveis.
          </LI>
        </UL>
        <P>
          Desativar cookies opcionais pode reduzir recursos personalizados, mas não impede a leitura dos
          nossos conteúdos.
        </P>
      </>
    ),
  },
  {
    id: 'retencao',
    title: 'Prazo de validade',
    body: (
      <>
        <P>
          Cookies de sessão expiram quando você fecha o navegador. Cookies persistentes têm validade
          definida no momento da gravação, variando de minutos a 24 meses, conforme a finalidade. Você
          pode apagar cookies a qualquer momento nas configurações do navegador.
        </P>
      </>
    ),
  },
  {
    id: 'mudancas',
    title: 'Atualizações',
    body: (
      <>
        <P>
          Esta política pode ser atualizada para refletir novas ferramentas, exigências legais ou
          melhorias na transparência. A data de última atualização será sempre exibida no topo desta
          página.
        </P>
      </>
    ),
  },
  {
    id: 'contato',
    title: 'Contato',
    body: (
      <P>
        Para dúvidas sobre cookies e rastreamento, escreva para{' '}
        <a href="mailto:contato@fatorintimo.com" className="text-accent hover:underline">
          contato@fatorintimo.com
        </a>
        . Você também pode consultar nossa{' '}
        <a href="/legal/privacidade" className="text-accent hover:underline">
          Política de Privacidade
        </a>{' '}
        para uma visão completa sobre tratamento de dados.
      </P>
    ),
  },
];

export default function CookiesPage() {
  return (
    <LegalPage
      label="Política de Cookies"
      title={
        <>
          Como utilizamos{' '}
          <span style={{ color: '#fe0050' }}>cookies</span> e rastreadores
        </>
      }
      intro="Cookies tornam a plataforma rápida, segura e personalizada, mas você decide quais aceitar. Aqui detalhamos o que utilizamos, com qual propósito e como gerenciar suas preferências."
      lastUpdated={LAST_UPDATED}
      sections={sections}
      contactSubject="Dúvida sobre cookies e rastreadores"
      contactCta="Falar com a equipe"
    />
  );
}
