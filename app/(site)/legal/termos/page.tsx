import type { Metadata } from 'next';
import LegalPage, { P, UL, LI, Strong } from '@/components/legal/LegalPage';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Termos & Condições',
  description:
    'Termos e condições de uso da plataforma Fator Íntimo: regras de uso, responsabilidades, propriedade intelectual e limitação de responsabilidade.',
  path: '/legal/termos',
  keywords: ['termos de uso fator íntimo', 'condições de uso', 'termos e condições'],
});

const LAST_UPDATED = '15 de maio de 2026';

const sections = [
  {
    id: 'aceitacao',
    title: 'Aceitação destes termos',
    body: (
      <>
        <P>
          Bem-vindo ao <Strong>Fator Íntimo</Strong>. Estes Termos & Condições regem o uso da plataforma
          disponível em www.fatorintimo.com, incluindo nosso site, comunidade, conteúdos editoriais,
          produtos digitais, comunicações por e-mail e demais serviços conexos (em conjunto, a
          “Plataforma”).
        </P>
        <P>
          Ao acessar, navegar ou criar uma conta, você concorda integralmente com estes termos. Caso não
          concorde, recomendamos que não utilize a Plataforma.
        </P>
      </>
    ),
  },
  {
    id: 'sobre-o-servico',
    title: 'Sobre o serviço',
    body: (
      <>
        <P>
          O Fator Íntimo é uma plataforma de mídia digital especializada em relacionamentos, inteligência
          emocional, psicologia aplicada, masculinidade, feminilidade e dinâmicas afetivas modernas.
          Oferecemos:
        </P>
        <UL>
          <LI>Artigos editoriais publicados no blog.</LI>
          <LI>Guias gratuitos em formato digital.</LI>
          <LI>E-books e produtos digitais pagos.</LI>
          <LI>Uma comunidade para discussões e reflexões.</LI>
          <LI>Newsletter e comunicações por e-mail.</LI>
          <LI>Ferramentas de comentários, depoimentos e avaliações.</LI>
        </UL>
        <P>
          Os serviços evoluem continuamente. Podemos lançar, modificar, suspender ou descontinuar
          recursos sem aviso prévio, ressalvados os direitos já adquiridos por clientes pagantes.
        </P>
      </>
    ),
  },
  {
    id: 'elegibilidade',
    title: 'Elegibilidade',
    body: (
      <>
        <P>
          O acesso é destinado a maiores de 18 anos. Ao utilizar a Plataforma, você declara que possui
          capacidade civil plena para celebrar acordos e que não está impedido por lei ou decisão
          judicial de utilizar serviços dessa natureza.
        </P>
      </>
    ),
  },
  {
    id: 'contas',
    title: 'Conta de usuário',
    body: (
      <>
        <P>
          Algumas funcionalidades exigem cadastro. Você é responsável por manter a confidencialidade da
          sua senha e por todas as atividades realizadas a partir da sua conta. Solicitamos que você:
        </P>
        <UL>
          <LI>Forneça informações verdadeiras, completas e atualizadas no cadastro.</LI>
          <LI>Não compartilhe sua conta nem permita o uso por terceiros.</LI>
          <LI>
            Comunique imediatamente qualquer suspeita de acesso não autorizado por meio do e-mail{' '}
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
    id: 'compras',
    title: 'Produtos digitais e pagamentos',
    body: (
      <>
        <P>
          Produtos digitais (e-books, guias premium, materiais e demais conteúdos pagos) são entregues
          eletronicamente após confirmação do pagamento. Os preços exibidos são em Reais (R$) e podem ser
          alterados a qualquer tempo, sem efeito retroativo sobre compras já realizadas.
        </P>
        <P>
          Pagamentos são processados por parceiros especializados (Stripe e meios afins). Ao concluir uma
          compra, você autoriza a cobrança do valor e a entrega imediata do conteúdo digital.
        </P>
        <P>
          Consulte nossa{' '}
          <a href="/legal/reembolsos" className="text-accent hover:underline">
            Política de Reembolso
          </a>{' '}
          para entender os prazos e condições aplicáveis.
        </P>
      </>
    ),
  },
  {
    id: 'uso-de-conteudo',
    title: 'Uso permitido de conteúdo digital',
    body: (
      <>
        <P>
          Ao adquirir um produto digital, você recebe uma licença pessoal, intransferível e não
          exclusiva, para uso individual, com fins de estudo e desenvolvimento próprio.
        </P>
        <P>É expressamente proibido:</P>
        <UL>
          <LI>Revender, sublicenciar, alugar ou redistribuir o material.</LI>
          <LI>Reproduzir trechos relevantes em mídias externas sem autorização escrita prévia.</LI>
          <LI>Compartilhar PDFs, vídeos ou senhas de acesso em grupos, fóruns ou redes sociais.</LI>
          <LI>Usar o conteúdo para criar produtos derivados, treinar modelos ou gerar ofertas concorrentes.</LI>
        </UL>
        <P>
          Veja também nossa{' '}
          <a href="/legal/direitos-autorais" className="text-accent hover:underline">
            Política de Direitos Autorais
          </a>
          .
        </P>
      </>
    ),
  },
  {
    id: 'comportamento',
    title: 'Conduta esperada',
    body: (
      <>
        <P>Para preservar um ambiente saudável, é proibido utilizar a Plataforma para:</P>
        <UL>
          <LI>Assediar, intimidar, difamar, ameaçar ou expor terceiros.</LI>
          <LI>Promover discurso de ódio, preconceito, violência ou desinformação.</LI>
          <LI>
            Compartilhar conteúdo ilegal, pornográfico, violento contra crianças ou que viole direitos
            de terceiros.
          </LI>
          <LI>Praticar spam, engenharia social, phishing ou tentativas de fraude.</LI>
          <LI>Tentar acessar áreas restritas, executar engenharia reversa ou contornar mecanismos de segurança.</LI>
          <LI>Carregar vírus, scripts maliciosos ou qualquer software hostil.</LI>
          <LI>Coletar dados de outros usuários por meios automatizados ou não autorizados.</LI>
        </UL>
        <P>
          Detalhes sobre comportamento em espaços comunitários estão na nossa{' '}
          <a href="/legal/diretrizes-comunidade" className="text-accent hover:underline">
            Política da Comunidade
          </a>
          .
        </P>
      </>
    ),
  },
  {
    id: 'conteudo-usuario',
    title: 'Conteúdo gerado por usuários',
    body: (
      <>
        <P>
          Publicações na comunidade, depoimentos, comentários e avaliações são de responsabilidade de
          quem os envia. Ao publicar, você declara:
        </P>
        <UL>
          <LI>Ser autor do conteúdo ou possuir os direitos necessários para compartilhá-lo.</LI>
          <LI>
            Conceder ao Fator Íntimo uma licença mundial, gratuita e não exclusiva para hospedar, exibir,
            distribuir e promover o conteúdo na Plataforma e em peças editoriais relacionadas.
          </LI>
          <LI>Aceitar que conteúdo público pode ser visto, compartilhado e citado por outros.</LI>
        </UL>
        <P>
          Podemos moderar, editar, ocultar ou remover qualquer conteúdo que viole estes termos, sem aviso
          prévio.
        </P>
      </>
    ),
  },
  {
    id: 'propriedade-intelectual',
    title: 'Propriedade intelectual',
    body: (
      <>
        <P>
          Todo conteúdo produzido pelo Fator Íntimo — artigos, e-books, guias, vídeos, ilustrações,
          marca, identidade visual, código, design e estrutura editorial — é protegido pela legislação de
          direitos autorais e marcas. O uso não autorizado pode acarretar responsabilização civil e
          criminal.
        </P>
        <P>
          Veja a{' '}
          <a href="/legal/direitos-autorais" className="text-accent hover:underline">
            Política de Direitos Autorais
          </a>{' '}
          para detalhes sobre uso, citação e contato para denúncias.
        </P>
      </>
    ),
  },
  {
    id: 'links-externos',
    title: 'Links e serviços de terceiros',
    body: (
      <>
        <P>
          A Plataforma pode conter links para sites e serviços externos. Não somos responsáveis pelo
          conteúdo, políticas ou práticas desses terceiros. Recomendamos que você leia os respectivos
          termos antes de utilizá-los.
        </P>
      </>
    ),
  },
  {
    id: 'disclaimer',
    title: 'Natureza educacional do conteúdo',
    body: (
      <>
        <P>
          O conteúdo do Fator Íntimo é informativo e educacional. Não substitui consulta com profissional
          de saúde mental, psicoterapia, aconselhamento médico, jurídico ou financeiro. Consulte sempre
          nosso{' '}
          <a href="/legal/aviso-legal" className="text-accent hover:underline">
            Aviso Legal
          </a>
          .
        </P>
      </>
    ),
  },
  {
    id: 'limitacao',
    title: 'Limitação de responsabilidade',
    body: (
      <>
        <P>
          Na máxima extensão permitida em lei, o Fator Íntimo, seus controladores, sócios, colaboradores e
          parceiros não respondem por danos indiretos, incidentais, lucros cessantes, perda de
          oportunidade ou danos emocionais decorrentes do uso ou da impossibilidade de uso da Plataforma.
        </P>
        <P>
          Nossas obrigações se limitam à entrega do conteúdo contratado. A interpretação e aplicação
          prática do material adquirido são de responsabilidade individual de cada leitor.
        </P>
      </>
    ),
  },
  {
    id: 'suspensao',
    title: 'Suspensão e encerramento',
    body: (
      <>
        <P>
          Podemos suspender ou encerrar o acesso de qualquer pessoa que descumpra estes termos,
          comprometa a segurança da Plataforma ou prejudique outros membros. Quando possível, enviaremos
          aviso prévio; em casos graves, a suspensão pode ser imediata.
        </P>
        <P>
          Você pode encerrar sua conta a qualquer momento entrando em contato pelo e-mail{' '}
          <a href="mailto:contato@fatorintimo.com" className="text-accent hover:underline">
            contato@fatorintimo.com
          </a>
          .
        </P>
      </>
    ),
  },
  {
    id: 'alteracoes',
    title: 'Alterações destes termos',
    body: (
      <>
        <P>
          Podemos atualizar estes Termos & Condições a qualquer momento. A versão vigente sempre estará
          publicada nesta página, com a data de última atualização. Alterações relevantes serão
          comunicadas aos usuários cadastrados.
        </P>
      </>
    ),
  },
  {
    id: 'lei-aplicavel',
    title: 'Lei aplicável e foro',
    body: (
      <>
        <P>
          Estes termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da
          Comarca onde o Fator Íntimo possui sede, com renúncia expressa a qualquer outro, por mais
          privilegiado que seja, para dirimir controvérsias.
        </P>
      </>
    ),
  },
];

export default function TermosPage() {
  return (
    <LegalPage
      label="Termos & Condições"
      title={
        <>
          Regras claras para usar o{' '}
          <span style={{ color: '#fe0050' }}>Fator Íntimo</span>
        </>
      }
      intro="Estes termos definem direitos, deveres e expectativas entre você e o Fator Íntimo. Escritos para ser lidos por gente, não só por advogados — mas sem perder o rigor que esse tipo de documento exige."
      lastUpdated={LAST_UPDATED}
      sections={sections}
      contactSubject="Dúvida sobre Termos & Condições"
      contactCta="Falar com a equipe"
    />
  );
}
