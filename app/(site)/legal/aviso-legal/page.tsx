import type { Metadata } from 'next';
import LegalPage, { P, UL, LI, Strong } from '@/components/legal/LegalPage';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Aviso Legal',
  description:
    'Aviso legal sobre a natureza educacional do conteúdo do Fator Íntimo. Não substitui psicoterapia, aconselhamento médico, jurídico ou financeiro.',
  path: '/legal/aviso-legal',
  keywords: ['aviso legal fator íntimo', 'disclaimer', 'conteúdo educacional'],
});

const LAST_UPDATED = '15 de maio de 2026';

const sections = [
  {
    id: 'natureza-do-conteudo',
    title: 'Natureza do conteúdo',
    body: (
      <>
        <P>
          O conteúdo publicado pelo <Strong>Fator Íntimo</Strong> — artigos, guias, e-books, vídeos,
          newsletters, comunicações e interações em comunidade — tem caráter exclusivamente{' '}
          <Strong>informativo, educacional e reflexivo</Strong>. Trata-se de leitura de apoio para quem
          deseja compreender melhor relacionamentos, emoções, comportamento humano e dinâmicas afetivas.
        </P>
        <P>
          Nada do que publicamos deve ser interpretado como diagnóstico, prescrição, tratamento, terapia
          ou aconselhamento profissional individualizado.
        </P>
      </>
    ),
  },
  {
    id: 'nao-substitui',
    title: 'O que o Fator Íntimo não é',
    body: (
      <>
        <P>Para que não haja dúvida, este conteúdo:</P>
        <UL>
          <LI>
            <Strong>Não substitui psicoterapia</Strong> ou acompanhamento por psicólogo, psicanalista,
            terapeuta ou profissional de saúde mental devidamente registrado.
          </LI>
          <LI>
            <Strong>Não constitui aconselhamento médico</Strong>, psiquiátrico ou farmacológico. Se você
            está em sofrimento intenso, com pensamentos de automutilação ou suicídio, procure imediatamente
            um serviço de emergência ou ligue para o CVV (188) no Brasil.
          </LI>
          <LI>
            <Strong>Não é aconselhamento jurídico</Strong>. Decisões legais devem ser tomadas com apoio de
            advogado habilitado.
          </LI>
          <LI>
            <Strong>Não é aconselhamento financeiro</Strong> ou recomendação de investimento.
          </LI>
          <LI>
            <Strong>Não é serviço de mediação de relacionamentos</Strong>, terapia de casal ou intervenção
            em conflitos familiares.
          </LI>
        </UL>
      </>
    ),
  },
  {
    id: 'opinioes',
    title: 'Opiniões, perspectivas e generalizações',
    body: (
      <>
        <P>
          Os textos e materiais refletem leituras, interpretações e referências do time editorial do
          Fator Íntimo. Tratamos temas complexos por meio de generalizações úteis, modelos conceituais e
          exemplos didáticos. Eles existem para iluminar padrões — não para descrever exatamente o que
          acontece em uma vida específica.
        </P>
        <P>
          Cada relacionamento tem nuances que somente quem o vive pode acessar. Use o material como ponto
          de partida para reflexão, não como verdade definitiva sobre você ou sobre outros.
        </P>
      </>
    ),
  },
  {
    id: 'responsabilidade-pessoal',
    title: 'Responsabilidade pelas próprias decisões',
    body: (
      <>
        <P>
          Você é a única pessoa responsável por como interpreta, aplica e discute os conteúdos do Fator
          Íntimo. Isso inclui decisões emocionais, comportamentais, conversas com parceiros, escolhas
          relacionais e qualquer mudança significativa que decida implementar a partir do que leu.
        </P>
        <P>
          Recomendamos cautela com generalizações apressadas, rótulos definitivos sobre outras pessoas e
          decisões importantes baseadas exclusivamente em uma única leitura, vídeo ou guia.
        </P>
      </>
    ),
  },
  {
    id: 'resultados',
    title: 'Resultados individuais variam',
    body: (
      <>
        <P>
          Nenhum conteúdo, ferramenta ou material pode garantir resultados específicos em
          relacionamentos, comunicação, autoconhecimento ou bem-estar emocional. O contexto pessoal,
          histórico, momento de vida e dedicação fazem diferença significativa.
        </P>
        <P>
          Depoimentos publicados representam experiências individuais. Não constituem promessa de
          resultados equivalentes para outras pessoas.
        </P>
      </>
    ),
  },
  {
    id: 'links-externos',
    title: 'Links externos e referências',
    body: (
      <>
        <P>
          Eventualmente citamos pesquisas, autores, obras ou serviços externos. Esses links e referências
          aparecem para enriquecer o entendimento. Não temos responsabilidade pelo conteúdo, decisões ou
          eventuais inconsistências de fontes externas.
        </P>
      </>
    ),
  },
  {
    id: 'parceiros',
    title: 'Indicações e afiliações',
    body: (
      <>
        <P>
          Quando recomendamos produtos próprios ou de parceiros — em e-mails, conteúdos editoriais ou
          materiais pagos — fazemos isso por avaliarmos seu valor. Caso uma indicação seja patrocinada ou
          envolva comissão de afiliado, isso será sinalizado de forma transparente.
        </P>
      </>
    ),
  },
  {
    id: 'situacoes-emergencia',
    title: 'Situações de emergência ou risco',
    body: (
      <>
        <P>
          Se você ou alguém próximo enfrenta uma situação de risco emocional, violência doméstica,
          ideação suicida ou outra emergência, <Strong>procure ajuda profissional imediata</Strong>.
        </P>
        <UL>
          <LI>
            <Strong>CVV (Centro de Valorização da Vida) — Brasil:</Strong> ligue 188 ou acesse cvv.org.br.
          </LI>
          <LI>
            <Strong>Ligue 180 — Atendimento à Mulher (Brasil):</Strong> denúncias e orientação em casos de
            violência.
          </LI>
          <LI>
            <Strong>SAMU — Brasil:</Strong> ligue 192 em emergências médicas.
          </LI>
          <LI>
            <Strong>Fora do Brasil:</Strong> contate o serviço de emergência local ou linhas oficiais de
            apoio em sua região.
          </LI>
        </UL>
      </>
    ),
  },
  {
    id: 'mudancas',
    title: 'Atualizações deste aviso',
    body: (
      <P>
        Este aviso pode ser atualizado conforme a operação evolui. A versão vigente estará sempre
        disponível nesta página, com a data de última atualização no topo.
      </P>
    ),
  },
];

export default function AvisoLegalPage() {
  return (
    <LegalPage
      label="Aviso Legal"
      title={
        <>
          O Fator Íntimo é{' '}
          <span style={{ color: '#fe0050' }}>educacional</span>, não terapêutico
        </>
      }
      intro="Nosso conteúdo é leitura de apoio, não substituto para psicoterapia ou aconselhamento profissional. Este aviso deixa claros os limites — e onde buscar ajuda real quando ela for necessária."
      lastUpdated={LAST_UPDATED}
      sections={sections}
      contactSubject="Dúvida sobre o Aviso Legal"
      contactCta="Falar com a equipe"
    />
  );
}
