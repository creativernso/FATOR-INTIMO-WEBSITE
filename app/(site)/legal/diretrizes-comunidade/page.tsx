import type { Metadata } from 'next';
import LegalPage, { P, UL, LI, H3, Strong } from '@/components/legal/LegalPage';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Diretrizes da Comunidade',
  description:
    'Regras de convivência da Comunidade Íntima: respeito, conversas emocionais maduras, privacidade e zero tolerância a toxicidade.',
  path: '/legal/diretrizes-comunidade',
  keywords: ['comunidade fator íntimo', 'regras de comunidade', 'moderação'],
});

const LAST_UPDATED = '15 de maio de 2026';

const sections = [
  {
    id: 'principios',
    title: 'O que é a Comunidade Íntima',
    body: (
      <>
        <P>
          A <Strong>Comunidade Íntima</Strong> é um espaço para conversas reais sobre relacionamentos,
          emoções, autoconhecimento e o que ninguém costuma falar em voz alta. Reunimos pessoas que
          buscam clareza, não palco; profundidade, não performance.
        </P>
        <P>
          Estas diretrizes existem para que isso continue possível. Lê-las antes de publicar é um gesto de
          respeito por quem está aqui pelos mesmos motivos.
        </P>
      </>
    ),
  },
  {
    id: 'esperamos',
    title: 'O que esperamos de você',
    body: (
      <>
        <UL>
          <LI>
            <Strong>Respeito como base.</Strong> Discorde de ideias, nunca da dignidade da pessoa que as
            apresenta.
          </LI>
          <LI>
            <Strong>Vulnerabilidade com consciência.</Strong> Compartilhar dói às vezes, para você e
            para quem lê. Trate histórias alheias com o mesmo cuidado que gostaria que tratassem a sua.
          </LI>
          <LI>
            <Strong>Escuta antes do conselho.</Strong> Nem toda dor pede solução. Às vezes pede presença.
          </LI>
          <LI>
            <Strong>Honestidade emocional.</Strong> Fale do que sente, não do que acha que “deveria”
            sentir.
          </LI>
          <LI>
            <Strong>Maturidade nas discussões.</Strong> Argumente sem agredir. Mude de ideia quando fizer
            sentido. Esse é o tipo de inteligência que a comunidade premia.
          </LI>
        </UL>
      </>
    ),
  },
  {
    id: 'proibido',
    title: 'Comportamentos que não toleramos',
    body: (
      <>
        <H3>Assédio e ataques pessoais</H3>
        <P>
          Insultos, intimidação, perseguição, ridicularização, ameaças veladas ou abertas, em qualquer
          intensidade, são removidos sem debate.
        </P>
        <H3>Discurso de ódio e discriminação</H3>
        <P>
          Conteúdo que ataque pessoas por gênero, raça, etnia, sexualidade, religião, deficiência, idade,
          aparência, classe social ou nacionalidade não tem espaço aqui.
        </P>
        <H3>Toxicidade afetiva</H3>
        <P>
          Manipulação emocional, gaslighting, desprezo pela dor alheia, sarcasmo destrutivo e jogos de
          poder são contrários ao propósito da comunidade.
        </P>
        <H3>Conteúdo gráfico ou sexualmente explícito</H3>
        <P>
          A pauta envolve sexualidade emocional, intimidade e afeto. Não publicamos pornografia, nudez
          explícita, descrições gráficas de violência sexual ou conteúdo glamourizando abuso.
        </P>
        <H3>Spam, autopromoção fora de contexto, golpes</H3>
        <P>
          Vendas agressivas, links suspeitos, pirâmides, esquemas de afiliação fora de contexto, phishing
          ou qualquer prática para enganar membros levam à remoção e à suspensão da conta.
        </P>
        <H3>Exposição de terceiros</H3>
        <P>
          Não publique nomes, fotos, conversas privadas, telefones, endereços ou qualquer informação que
          identifique uma pessoa real sem consentimento dela. Falar da própria história é diferente de
          expor alguém.
        </P>
        <H3>Desinformação relacional ou de saúde mental</H3>
        <P>
          Conteúdo que apresenta opiniões como fatos científicos, promove “tratamentos milagrosos”,
          desencoraja terapia, glorifica sofrimento ou romantiza relações abusivas é removido.
        </P>
      </>
    ),
  },
  {
    id: 'privacidade',
    title: 'Privacidade e histórias pessoais',
    body: (
      <>
        <P>
          Quando você compartilha algo aqui, presume-se que outros leiam, sintam e, eventualmente,
          comentem. Considere o que está disposto a tornar público.
        </P>
        <UL>
          <LI>Evite identificar terceiros pelo nome real, sobrenome, foto ou local.</LI>
          <LI>Não compartilhe prints de conversas privadas reconhecíveis.</LI>
          <LI>Se for sensível, use anonimato, pseudônimo ou descrição genérica.</LI>
          <LI>
            Solicitações de exclusão da sua própria publicação podem ser feitas a qualquer momento pelo
            painel do usuário ou pelo e-mail{' '}
            <a href="mailto:contato@fatorintimo.com" className="text-accent hover:underline">
              contato@fatorintimo.com
            </a>
            .
          </LI>
        </UL>
      </>
    ),
  },
  {
    id: 'moderacao',
    title: 'Moderação e revisão',
    body: (
      <>
        <P>
          Publicações e comentários podem passar por revisão antes de aparecerem publicamente. Nosso time
          de moderação avalia conteúdos com critérios consistentes e olhar humano. Não usamos automação
          como única instância para decisões sensíveis.
        </P>
        <P>Decisões possíveis em casos de violação:</P>
        <UL>
          <LI>Edição leve para preservar o tom da comunidade (com indicação clara).</LI>
          <LI>Remoção do conteúdo.</LI>
          <LI>Advertência reservada por mensagem direta.</LI>
          <LI>Suspensão temporária da conta.</LI>
          <LI>Banimento permanente em casos graves ou reincidentes.</LI>
        </UL>
        <P>
          Você pode recorrer de qualquer decisão respondendo ao e-mail de notificação ou escrevendo para{' '}
          <a href="mailto:contato@fatorintimo.com" className="text-accent hover:underline">
            contato@fatorintimo.com
          </a>
          .
        </P>
      </>
    ),
  },
  {
    id: 'denuncias',
    title: 'Como denunciar uma violação',
    body: (
      <>
        <P>
          Se você encontrou um conteúdo que viola estas diretrizes, ajude a comunidade a se manter
          saudável:
        </P>
        <UL>
          <LI>Use a opção “denunciar” disponível na publicação ou comentário.</LI>
          <LI>Em casos graves (assédio direto, ameaças, exposição), escreva diretamente para a equipe.</LI>
          <LI>Não confronte agressores nos comentários. Acionar moderação é mais eficaz e protege você.</LI>
        </UL>
      </>
    ),
  },
  {
    id: 'situacoes-sensiveis',
    title: 'Quando há sinais de crise',
    body: (
      <>
        <P>
          Algumas histórias publicadas envolvem dor profunda. Se você notar que alguém demonstra sinais
          de crise (ideação suicida, automutilação, violência iminente), aja com cuidado:
        </P>
        <UL>
          <LI>Não tente diagnosticar nem dar conselhos clínicos.</LI>
          <LI>Acolha com empatia, sem minimizar a dor.</LI>
          <LI>Indique contatos de apoio profissional (CVV 188 no Brasil, serviço de emergência local).</LI>
          <LI>
            Sinalize o conteúdo à equipe de moderação, podemos oferecer suporte, recursos e, quando
            possível, encaminhar contatos institucionais.
          </LI>
        </UL>
      </>
    ),
  },
  {
    id: 'propriedade',
    title: 'Conteúdo que você publica',
    body: (
      <>
        <P>
          Você mantém os direitos sobre tudo o que publica. Ao postar, concede ao Fator Íntimo uma
          licença gratuita e não exclusiva para hospedar, exibir e, eventualmente, citar em comunicações
          editoriais (sempre com o devido crédito).
        </P>
        <P>
          Para mais detalhes, consulte os{' '}
          <a href="/legal/termos" className="text-accent hover:underline">
            Termos & Condições
          </a>{' '}
          e a{' '}
          <a href="/legal/direitos-autorais" className="text-accent hover:underline">
            Política de Direitos Autorais
          </a>
          .
        </P>
      </>
    ),
  },
  {
    id: 'mudancas',
    title: 'Atualizações destas diretrizes',
    body: (
      <P>
        As diretrizes evoluem conforme a comunidade cresce. Mudanças relevantes serão comunicadas com
        antecedência. A versão vigente está sempre disponível nesta página.
      </P>
    ),
  },
];

export default function DiretrizesComunidadePage() {
  return (
    <LegalPage
      label="Diretrizes da Comunidade"
      title={
        <>
          Um espaço para conversas{' '}
          <span style={{ color: '#fe0050' }}>reais</span>, não para barulho
        </>
      }
      intro="A Comunidade Íntima é construída sobre respeito, profundidade emocional e maturidade. Estas diretrizes existem para preservar isso, com firmeza onde for preciso."
      lastUpdated={LAST_UPDATED}
      sections={sections}
      contactSubject="Denúncia ou dúvida sobre a comunidade"
      contactCta="Falar com a moderação"
    />
  );
}
