import type { Metadata } from 'next';
import LegalPage, { P, UL, LI, H3, Strong } from '@/components/legal/LegalPage';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Política de Privacidade',
  description:
    'Como o Fator Íntimo coleta, usa e protege seus dados pessoais. Conformidade com LGPD (Brasil) e princípios GDPR (União Europeia).',
  path: '/legal/privacidade',
  keywords: ['privacidade fator íntimo', 'lgpd', 'gdpr', 'política de dados'],
});

const LAST_UPDATED = '15 de maio de 2026';

const sections = [
  {
    id: 'introducao',
    title: 'Introdução e quem somos',
    body: (
      <>
        <P>
          O <Strong>Fator Íntimo</Strong> é uma plataforma de mídia digital dedicada a relacionamentos,
          inteligência emocional, psicologia e dinâmicas humanas, acessível em{' '}
          <Strong>www.fatorintimo.com</Strong>. Esta Política de Privacidade explica, em linguagem clara,
          quais dados pessoais coletamos, por que coletamos, como utilizamos e quais são os seus direitos.
        </P>
        <P>
          Levamos privacidade a sério porque o tema central da nossa plataforma, a vida emocional e
          relacional das pessoas, exige confiança. Esta política se aplica a todos os visitantes,
          assinantes, leitores, membros da comunidade e clientes do Fator Íntimo, independentemente do
          país onde se encontram.
        </P>
        <P>
          Ao continuar utilizando nossos serviços, você reconhece ter lido e compreendido as práticas
          descritas neste documento.
        </P>
      </>
    ),
  },
  {
    id: 'dados-coletados',
    title: 'Quais dados coletamos',
    body: (
      <>
        <P>Coletamos apenas os dados necessários para operar a plataforma com qualidade e segurança.</P>
        <H3>Dados que você fornece diretamente</H3>
        <UL>
          <LI>
            <Strong>Cadastro e conta:</Strong> nome, e-mail, senha (armazenada de forma criptografada) e,
            opcionalmente, foto de perfil.
          </LI>
          <LI>
            <Strong>Compras:</Strong> nome, e-mail, endereço de cobrança e dados de pagamento processados
            por nossos parceiros (Stripe). Não armazenamos números completos de cartão em nossos servidores.
          </LI>
          <LI>
            <Strong>Comunidade e depoimentos:</Strong> publicações, comentários, reações e qualquer conteúdo
            que você escolha compartilhar publicamente.
          </LI>
          <LI>
            <Strong>Avaliações e formulários:</Strong> notas, comentários sobre produtos e respostas a
            formulários de feedback ou de captação de leads.
          </LI>
          <LI>
            <Strong>Comunicação direta:</Strong> mensagens enviadas por chat, e-mail ou outros canais de
            contato.
          </LI>
        </UL>
        <H3>Dados coletados automaticamente</H3>
        <UL>
          <LI>
            <Strong>Dados de navegação:</Strong> endereço IP, tipo de navegador, sistema operacional,
            páginas visitadas, tempo de permanência, origem do tráfego e dispositivo.
          </LI>
          <LI>
            <Strong>Cookies e tecnologias similares:</Strong> identificadores anônimos para sessão,
            preferências, segurança e métricas. Saiba mais na nossa{' '}
            <a href="/legal/cookies" className="text-accent hover:underline">Política de Cookies</a>.
          </LI>
          <LI>
            <Strong>Eventos de uso:</Strong> aberturas de e-mail, cliques, downloads de guias e interações
            com nossos materiais.
          </LI>
        </UL>
        <H3>Dados sensíveis</H3>
        <P>
          Não solicitamos nem coletamos intencionalmente dados pessoais sensíveis (origem racial, saúde,
          convicções religiosas, orientação sexual, etc.). Se você escolher compartilhar voluntariamente
          esse tipo de informação em publicações da comunidade ou depoimentos, está nos dando consentimento
          específico para exibi-la nos espaços onde foi publicada.
        </P>
      </>
    ),
  },
  {
    id: 'como-usamos',
    title: 'Como utilizamos seus dados',
    body: (
      <>
        <P>Utilizamos seus dados para finalidades específicas, transparentes e legítimas:</P>
        <UL>
          <LI>Operar sua conta, sessões e preferências dentro da plataforma.</LI>
          <LI>Entregar os produtos digitais, guias e conteúdos que você adquire ou solicita.</LI>
          <LI>
            Enviar comunicações relevantes: confirmações de pedido, atualizações do produto, novidades
            editoriais, newsletter e campanhas de e-mail marketing (sempre com opção de descadastro).
          </LI>
          <LI>Personalizar a experiência editorial e recomendações de conteúdo.</LI>
          <LI>
            Medir performance, entender padrões de uso e melhorar a qualidade da plataforma com base em
            dados agregados.
          </LI>
          <LI>Prevenir fraudes, abusos, comportamentos tóxicos e violações destas políticas.</LI>
          <LI>Cumprir obrigações legais, regulatórias, fiscais e judiciais.</LI>
        </UL>
      </>
    ),
  },
  {
    id: 'base-legal',
    title: 'Base legal para o tratamento',
    body: (
      <>
        <P>
          Tratamos dados pessoais somente quando há base legal apropriada. As principais bases que
          aplicamos:
        </P>
        <UL>
          <LI>
            <Strong>Consentimento</Strong>, quando você opta por receber e-mails, ativa cookies opcionais
            ou envia publicações na comunidade.
          </LI>
          <LI>
            <Strong>Execução de contrato</Strong>, para entregar materiais e produtos que você adquiriu.
          </LI>
          <LI>
            <Strong>Legítimo interesse</Strong>, para segurança, prevenção de fraudes, análise de
            performance agregada e proteção da plataforma e dos seus membros.
          </LI>
          <LI>
            <Strong>Obrigação legal</Strong>, para cumprir leis, regulamentos e ordens de autoridades
            competentes.
          </LI>
        </UL>
      </>
    ),
  },
  {
    id: 'compartilhamento',
    title: 'Com quem compartilhamos',
    body: (
      <>
        <P>
          Não vendemos seus dados pessoais. Compartilhamos informações apenas com prestadores de serviço
          confiáveis, sob contrato e por estrita necessidade operacional:
        </P>
        <UL>
          <LI>
            <Strong>Pagamentos:</Strong> Stripe, para processar transações.
          </LI>
          <LI>
            <Strong>E-mail transacional e marketing:</Strong> Resend, para enviar mensagens automatizadas
            e newsletters.
          </LI>
          <LI>
            <Strong>Infraestrutura e hospedagem:</Strong> Vercel e Firebase/Google Cloud, para hospedagem,
            banco de dados e armazenamento.
          </LI>
          <LI>
            <Strong>Análise:</Strong> ferramentas internas e, quando aplicável, Google Analytics e Meta
            Pixel para entender uso agregado e otimizar campanhas.
          </LI>
          <LI>
            <Strong>Autoridades:</Strong> apenas quando exigido por lei ou ordem judicial válida.
          </LI>
        </UL>
        <P>
          Esses parceiros recebem somente os dados estritamente necessários para o serviço contratado e são
          obrigados a tratá-los com confidencialidade e segurança.
        </P>
      </>
    ),
  },
  {
    id: 'transferencia-internacional',
    title: 'Transferência internacional',
    body: (
      <>
        <P>
          Alguns dos nossos provedores estão localizados fora do Brasil, em jurisdições com legislação de
          proteção de dados própria, como Estados Unidos e União Europeia. Quando isso ocorre, exigimos
          salvaguardas contratuais (Cláusulas Padrão de Proteção de Dados, certificações reconhecidas ou
          mecanismos equivalentes) para garantir que seus dados sigam protegidos com o mesmo padrão da
          LGPD e do GDPR.
        </P>
      </>
    ),
  },
  {
    id: 'seguranca',
    title: 'Segurança da informação',
    body: (
      <>
        <P>
          Adotamos medidas técnicas e organizacionais proporcionais aos riscos: criptografia em trânsito
          (HTTPS/TLS), controle de acesso baseado em funções, monitoramento de tentativas suspeitas,
          backups regulares e segregação de ambientes. Senhas são armazenadas em formato derivado e nunca
          em texto puro.
        </P>
        <P>
          Nenhum sistema é 100% inviolável. Caso ocorra um incidente que afete materialmente seus dados,
          notificaremos você e as autoridades competentes nos prazos previstos pela legislação aplicável.
        </P>
      </>
    ),
  },
  {
    id: 'retencao',
    title: 'Por quanto tempo guardamos seus dados',
    body: (
      <>
        <P>
          Mantemos seus dados pelo tempo necessário para cumprir as finalidades descritas nesta política
          ou conforme exigido por lei. Quando deixam de ser necessários, eles são eliminados ou
          anonimizados de forma segura.
        </P>
        <UL>
          <LI>
            <Strong>Conta ativa:</Strong> enquanto sua conta estiver ativa e por um período razoável após
            sua desativação, para fins de auditoria e cumprimento legal.
          </LI>
          <LI>
            <Strong>Compras e fiscais:</Strong> por prazos previstos na legislação fiscal e contábil
            (mínimo de 5 anos para registros de compra).
          </LI>
          <LI>
            <Strong>Marketing:</Strong> até o momento em que você se descadastrar ou solicitar a remoção.
          </LI>
        </UL>
      </>
    ),
  },
  {
    id: 'direitos',
    title: 'Seus direitos como titular de dados',
    body: (
      <>
        <P>
          A LGPD (Lei nº 13.709/2018) e o GDPR garantem direitos importantes sobre seus dados. Você pode
          exercê-los a qualquer momento entrando em contato pelo e-mail{' '}
          <a href="mailto:contato@fatorintimo.com" className="text-accent hover:underline">
            contato@fatorintimo.com
          </a>
          :
        </P>
        <UL>
          <LI><Strong>Acesso:</Strong> saber quais dados temos sobre você.</LI>
          <LI><Strong>Correção:</Strong> atualizar dados incompletos, inexatos ou desatualizados.</LI>
          <LI><Strong>Exclusão:</Strong> solicitar o apagamento, respeitadas as obrigações legais.</LI>
          <LI><Strong>Portabilidade:</Strong> receber uma cópia dos dados em formato estruturado.</LI>
          <LI><Strong>Oposição:</Strong> opor-se a tratamentos baseados em legítimo interesse.</LI>
          <LI><Strong>Revogação de consentimento:</Strong> retirar autorizações concedidas anteriormente.</LI>
          <LI><Strong>Não discriminação:</Strong> exercer seus direitos sem penalização.</LI>
          <LI><Strong>Reclamação:</Strong> apresentar reclamação à autoridade competente (no Brasil, a ANPD).</LI>
        </UL>
        <P>
          Responderemos solicitações no prazo legal aplicável, podendo solicitar verificação de identidade
          antes de prosseguir, para evitar acesso indevido aos seus dados por terceiros.
        </P>
      </>
    ),
  },
  {
    id: 'marketing-emails',
    title: 'E-mail marketing e descadastro',
    body: (
      <>
        <P>
          Enviamos comunicações por e-mail quando você se cadastra, baixa um guia, faz uma compra ou opta
          por receber novidades. Toda mensagem de marketing contém um link de descadastro visível, e a
          remoção é imediata após o clique.
        </P>
        <P>
          Mesmo que você opte por sair de listas de marketing, ainda receberá comunicações estritamente
          necessárias, confirmações de compra, alertas de segurança e informações sobre sua conta.
        </P>
      </>
    ),
  },
  {
    id: 'criancas',
    title: 'Conteúdo destinado a adultos',
    body: (
      <>
        <P>
          O Fator Íntimo trata de temas adultos como relacionamentos, sexualidade emocional e dinâmicas
          afetivas. A plataforma é destinada a maiores de 18 anos. Não coletamos intencionalmente dados de
          menores de idade. Se acreditamos que uma conta foi criada por um menor, podemos suspendê-la e
          remover os dados associados.
        </P>
      </>
    ),
  },
  {
    id: 'mudancas',
    title: 'Alterações desta política',
    body: (
      <>
        <P>
          Podemos atualizar esta Política de Privacidade para refletir mudanças em nossa operação ou em
          obrigações legais. A versão vigente sempre estará disponível nesta página, com a data de última
          atualização no topo. Alterações materiais serão comunicadas com destaque a quem possui conta.
        </P>
      </>
    ),
  },
  {
    id: 'contato',
    title: 'Como falar conosco',
    body: (
      <>
        <P>
          Dúvidas, solicitações de direitos do titular ou denúncias relacionadas a privacidade podem ser
          enviadas para{' '}
          <a href="mailto:contato@fatorintimo.com" className="text-accent hover:underline">
            contato@fatorintimo.com
          </a>
          . Identificamos cada pedido, registramos a solicitação e respondemos dentro dos prazos legais
          aplicáveis.
        </P>
      </>
    ),
  },
];

export default function PrivacidadePage() {
  return (
    <LegalPage
      label="Política de Privacidade"
      title={
        <>
          Como tratamos seus{' '}
          <span style={{ color: '#fe0050' }}>dados pessoais</span>
        </>
      }
      intro="Esta política descreve, sem jargão, como o Fator Íntimo coleta, utiliza, armazena e protege as informações de quem visita, lê, se inscreve, compra e participa da nossa plataforma."
      lastUpdated={LAST_UPDATED}
      sections={sections}
      contactSubject="Solicitação de privacidade, LGPD/GDPR"
      contactCta="Exercer meus direitos"
    />
  );
}
