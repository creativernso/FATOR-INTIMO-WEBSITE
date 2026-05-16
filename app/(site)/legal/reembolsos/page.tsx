import type { Metadata } from 'next';
import LegalPage, { P, UL, LI, Strong } from '@/components/legal/LegalPage';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Política de Reembolso',
  description:
    'Regras de reembolso para produtos digitais do Fator Íntimo: garantia de 7 dias, elegibilidade e como solicitar.',
  path: '/legal/reembolsos',
  keywords: ['reembolso fator íntimo', 'garantia 7 dias', 'devolução produto digital'],
});

const LAST_UPDATED = '15 de maio de 2026';

const sections = [
  {
    id: 'compromisso',
    title: 'Nosso compromisso',
    body: (
      <>
        <P>
          Acreditamos no impacto do que produzimos. Por isso, todo produto digital do Fator Íntimo,
          e-books, guias premium, materiais e cursos digitais, vem com{' '}
          <Strong>garantia incondicional de 7 dias</Strong>, em conformidade com o art. 49 do Código de
          Defesa do Consumidor.
        </P>
        <P>
          Se nesse período você concluir que o material não é o que esperava, devolvemos 100% do valor
          pago. Sem perguntas constrangedoras, sem burocracia desnecessária.
        </P>
      </>
    ),
  },
  {
    id: 'elegibilidade',
    title: 'Quem tem direito ao reembolso',
    body: (
      <>
        <P>O reembolso é garantido nas seguintes condições:</P>
        <UL>
          <LI>
            A solicitação deve ser feita em até <Strong>7 (sete) dias corridos</Strong> a partir da
            confirmação da compra.
          </LI>
          <LI>O pedido precisa ser feito pelo mesmo e-mail utilizado no momento da compra.</LI>
          <LI>
            O conteúdo adquirido deve ser um produto digital comercializado oficialmente pelo Fator Íntimo.
          </LI>
        </UL>
        <P>
          Após o período de 7 dias, não há obrigação legal de reembolso para conteúdos digitais já
          entregues. Casos excepcionais podem ser avaliados caso a caso pela equipe.
        </P>
      </>
    ),
  },
  {
    id: 'como-solicitar',
    title: 'Como solicitar',
    body: (
      <>
        <P>O processo é simples e direto:</P>
        <UL>
          <LI>
            Envie um e-mail para{' '}
            <a href="mailto:contato@fatorintimo.com" className="text-accent hover:underline">
              contato@fatorintimo.com
            </a>{' '}
            com o assunto <Strong>“Solicitação de reembolso”</Strong>.
          </LI>
          <LI>Inclua o nome usado na compra, o e-mail de contato e o nome do produto adquirido.</LI>
          <LI>
            Você pode, opcionalmente, contar o que não atendeu à expectativa, isso ajuda a melhorar o
            material, mas não é obrigatório.
          </LI>
        </UL>
      </>
    ),
  },
  {
    id: 'prazo',
    title: 'Prazo de processamento',
    body: (
      <>
        <P>
          Confirmamos o recebimento da solicitação em até <Strong>2 dias úteis</Strong>. O reembolso é
          processado pelo nosso operador de pagamento (Stripe) imediatamente após a aprovação. O tempo
          até o valor retornar à sua conta depende do método utilizado:
        </P>
        <UL>
          <LI><Strong>Cartão de crédito:</Strong> 5 a 15 dias úteis, conforme a operadora.</LI>
          <LI><Strong>PIX:</Strong> tipicamente em até 5 dias úteis.</LI>
          <LI><Strong>Boleto ou outras formas:</Strong> conforme política do meio de pagamento utilizado.</LI>
        </UL>
      </>
    ),
  },
  {
    id: 'acesso-pos-reembolso',
    title: 'Acesso ao conteúdo após o reembolso',
    body: (
      <>
        <P>
          Aprovado o reembolso, o acesso ao produto digital é encerrado. Pedimos, em respeito ao trabalho
          de quem produziu o material, que arquivos baixados sejam excluídos. A redistribuição,
          republicação ou uso comercial do material após o reembolso é vedada e pode ensejar medidas
          legais.
        </P>
      </>
    ),
  },
  {
    id: 'abuso',
    title: 'Prevenção de abuso',
    body: (
      <>
        <P>
          A garantia de 7 dias existe para proteger quem realmente experimenta o material com boa-fé. Em
          casos de uso indevido, múltiplas compras seguidas de reembolso, redistribuição não autorizada,
          fraude no pagamento ou outras formas evidentes de abuso, reservamo-nos o direito de:
        </P>
        <UL>
          <LI>Recusar o reembolso.</LI>
          <LI>Bloquear contas e impedir futuras compras.</LI>
          <LI>Adotar as medidas administrativas, cíveis ou criminais cabíveis.</LI>
        </UL>
      </>
    ),
  },
  {
    id: 'compras-promocionais',
    title: 'Compras em campanhas e bundles',
    body: (
      <>
        <P>
          Compras realizadas em campanhas, combos, bundles e ofertas por tempo limitado também são
          cobertas pela garantia de 7 dias. Nesses casos, o reembolso ocorre sobre o valor efetivamente
          pago. Se o conteúdo foi adquirido como parte de um pacote, o reembolso considera o pacote
          completo, não itens isolados.
        </P>
      </>
    ),
  },
  {
    id: 'guias-gratuitos',
    title: 'Guias gratuitos e conteúdos sem custo',
    body: (
      <>
        <P>
          Guias gratuitos, newsletters, artigos do blog e materiais sem custo não envolvem transação
          financeira e, portanto, não estão sujeitos a reembolso. Você pode interromper o recebimento a
          qualquer momento pelo link de descadastro nos e-mails ou solicitando exclusão da sua conta.
        </P>
      </>
    ),
  },
  {
    id: 'problemas-tecnicos',
    title: 'Problemas técnicos com acesso',
    body: (
      <>
        <P>
          Se você não conseguiu acessar o produto, baixar o material ou recebeu um arquivo corrompido,
          tente primeiro:
        </P>
        <UL>
          <LI>Verificar a caixa de spam pelo e-mail de confirmação.</LI>
          <LI>Conferir se o pagamento foi aprovado pelo seu banco ou operadora.</LI>
          <LI>Testar em outro navegador ou dispositivo.</LI>
        </UL>
        <P>
          Caso o problema persista, escreva para{' '}
          <a href="mailto:contato@fatorintimo.com" className="text-accent hover:underline">
            contato@fatorintimo.com
          </a>{' '}
          informando o e-mail da compra. Resolvemos rapidamente, e isso não consome seus 7 dias de
          garantia.
        </P>
      </>
    ),
  },
  {
    id: 'mudancas',
    title: 'Atualizações desta política',
    body: (
      <P>
        Esta política pode ser revista para refletir mudanças operacionais ou regulatórias. A versão
        vigente sempre estará disponível nesta página, com a data de última atualização no topo. Compras
        anteriores são regidas pelos termos vigentes na data da transação.
      </P>
    ),
  },
];

export default function ReembolsosPage() {
  return (
    <LegalPage
      label="Política de Reembolso"
      title={
        <>
          Garantia incondicional de{' '}
          <span style={{ color: '#fe0050' }}>7 dias</span>
        </>
      }
      intro="Acreditamos no que produzimos, mas o experimento real é seu. Se o material não fizer sentido nos primeiros 7 dias, devolvemos seu dinheiro, sem burocracia, sem julgamento."
      lastUpdated={LAST_UPDATED}
      sections={sections}
      contactSubject="Solicitação de reembolso"
      contactCta="Solicitar reembolso"
    />
  );
}
