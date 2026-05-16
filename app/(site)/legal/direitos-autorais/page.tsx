import type { Metadata } from 'next';
import LegalPage, { P, UL, LI, H3, Strong } from '@/components/legal/LegalPage';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Direitos Autorais & Propriedade Intelectual',
  description:
    'Política de propriedade intelectual do Fator Íntimo: proteção de artigos, e-books, guias, marca, identidade visual e contato para denúncias.',
  path: '/legal/direitos-autorais',
  keywords: ['direitos autorais', 'propriedade intelectual', 'dmca', 'pirataria'],
});

const LAST_UPDATED = '15 de maio de 2026';

const sections = [
  {
    id: 'titularidade',
    title: 'Titularidade dos conteúdos',
    body: (
      <>
        <P>
          Todo o material publicado pelo <Strong>Fator Íntimo</Strong>, artigos, e-books, guias,
          newsletters, vídeos, ilustrações, fotografias, design, identidade visual, marca, logotipos,
          tipografia, código-fonte e estrutura editorial, é protegido pela Lei de Direitos Autorais
          brasileira (Lei nº 9.610/98), pela Convenção de Berna e por tratados internacionais aplicáveis.
        </P>
        <P>
          A titularidade pertence ao Fator Íntimo (ou aos respectivos licenciantes, quando indicado). O
          uso não autorizado pode resultar em medidas administrativas, cíveis e criminais.
        </P>
      </>
    ),
  },
  {
    id: 'permitido',
    title: 'O que é permitido',
    body: (
      <>
        <P>Você pode, sem solicitar autorização prévia:</P>
        <UL>
          <LI>
            Compartilhar links públicos para nossos artigos, guias e produtos em redes sociais, mensagens
            e e-mails pessoais.
          </LI>
          <LI>
            Citar trechos curtos (até cerca de 200 caracteres) com a finalidade de comentário,
            referência ou análise, desde que com crédito ao autor e link para a fonte original.
          </LI>
          <LI>
            Imprimir uma cópia individual de e-book ou guia adquirido, para uso pessoal e estritamente
            não comercial.
          </LI>
        </UL>
      </>
    ),
  },
  {
    id: 'proibido',
    title: 'O que é proibido sem autorização',
    body: (
      <>
        <UL>
          <LI>Reproduzir, copiar ou redistribuir conteúdo em outros sites, blogs ou plataformas.</LI>
          <LI>
            Vender, alugar, sublicenciar, doar ou compartilhar arquivos de e-books, guias premium,
            vídeos ou materiais pagos.
          </LI>
          <LI>
            Criar produtos derivados (resumos, traduções, adaptações, cursos, podcasts ou newsletters)
            baseados no nosso material.
          </LI>
          <LI>
            Usar marca, logotipo, identidade visual ou nome “Fator Íntimo” em produtos, campanhas, perfis
            sociais, domínios ou peças publicitárias sem autorização escrita.
          </LI>
          <LI>
            Utilizar o conteúdo como base para treinamento de modelos de inteligência artificial, sem
            licença específica concedida pelo Fator Íntimo.
          </LI>
          <LI>
            Remover, alterar ou ocultar marcas d’água, créditos, avisos de direitos autorais ou
            mecanismos técnicos de proteção.
          </LI>
        </UL>
      </>
    ),
  },
  {
    id: 'marca',
    title: 'Marca e identidade visual',
    body: (
      <>
        <P>
          “Fator Íntimo” é uma marca em uso comercial. O logotipo, paleta de cores, tipografia, ícones e
          composição visual fazem parte de uma identidade protegida. O uso para qualquer finalidade
          comercial, incluindo materiais de afiliados ou parceiros, depende de autorização específica
          obtida por escrito.
        </P>
      </>
    ),
  },
  {
    id: 'licenca-compradores',
    title: 'Licença concedida a compradores',
    body: (
      <>
        <P>
          Ao adquirir um produto digital, você recebe uma <Strong>licença pessoal, intransferível,
          não exclusiva e mundial</Strong>, com vigência indeterminada, para uso individual com
          finalidade educacional.
        </P>
        <P>
          A licença não autoriza nenhuma forma de reprodução, exibição pública, distribuição,
          comunicação ao público ou exploração comercial do material.
        </P>
      </>
    ),
  },
  {
    id: 'conteudo-usuario',
    title: 'Conteúdo enviado por usuários',
    body: (
      <>
        <P>
          Publicações na comunidade, depoimentos, comentários e avaliações continuam sendo do autor que
          os enviou. Ao publicar, você nos concede licença gratuita, mundial e não exclusiva para
          hospedar, exibir, citar e promover esse conteúdo dentro da Plataforma e em peças editoriais
          relacionadas, sempre com crédito quando aplicável.
        </P>
        <P>
          Você é responsável pela originalidade e legitimidade do que publica. Garantir que possui os
          direitos necessários antes de compartilhar é parte do compromisso ao usar a Plataforma.
        </P>
      </>
    ),
  },
  {
    id: 'denuncias',
    title: 'Notificações de violação (DMCA / LDA)',
    body: (
      <>
        <P>
          Se você acredita que algum conteúdo publicado no Fator Íntimo viola direitos autorais ou
          marcas de sua titularidade, envie uma notificação completa para{' '}
          <a href="mailto:contato@fatorintimo.com" className="text-accent hover:underline">
            contato@fatorintimo.com
          </a>{' '}
          com o assunto <Strong>“Denúncia de direitos autorais”</Strong>. Para que possamos avaliar com
          rigor, inclua:
        </P>
        <H3>Informações obrigatórias</H3>
        <UL>
          <LI>Identificação clara da obra original e prova razoável de titularidade.</LI>
          <LI>URL completo do conteúdo apontado como infrator no Fator Íntimo.</LI>
          <LI>Descrição da violação e justificativa.</LI>
          <LI>
            Seus dados de contato (nome completo, e-mail e telefone) e, se aplicável, do
            representante legal.
          </LI>
          <LI>
            Declaração assinada (digital ou eletrônica) afirmando boa-fé e veracidade das informações,
            sob pena de responsabilização.
          </LI>
        </UL>
        <H3>Procedimento</H3>
        <UL>
          <LI>Confirmamos o recebimento em até 2 dias úteis.</LI>
          <LI>Análise técnica e jurídica em até 10 dias úteis.</LI>
          <LI>
            Quando aplicável, o conteúdo é removido ou ocultado, e o usuário envolvido é notificado para
            apresentar contranotificação, se desejar.
          </LI>
          <LI>
            Em casos de uso abusivo do procedimento (denúncias falsas ou de má-fé), reservamo-nos o
            direito de adotar medidas legais cabíveis.
          </LI>
        </UL>
      </>
    ),
  },
  {
    id: 'contranotificacao',
    title: 'Contranotificação',
    body: (
      <>
        <P>
          Se você é autor de um conteúdo removido por engano, pode apresentar contranotificação
          fundamentada para{' '}
          <a href="mailto:contato@fatorintimo.com" className="text-accent hover:underline">
            contato@fatorintimo.com
          </a>
          , incluindo:
        </P>
        <UL>
          <LI>Identificação do material removido.</LI>
          <LI>Declaração, sob pena de responsabilização, de que possui os direitos sobre a obra.</LI>
          <LI>Documentos e provas que sustentem o pedido.</LI>
        </UL>
        <P>
          Avaliamos cada caso individualmente e podemos restabelecer o conteúdo caso a contranotificação
          seja procedente.
        </P>
      </>
    ),
  },
  {
    id: 'parcerias',
    title: 'Parcerias, citações e uso editorial',
    body: (
      <>
        <P>
          Solicitações de parceria, uso editorial, entrevista, citação em livros ou pesquisa acadêmica
          podem ser encaminhadas pelo e-mail oficial. Respondemos com seriedade dentro de prazos
          razoáveis, especialmente quando o uso pretendido respeita o autor e a integridade do material
          original.
        </P>
      </>
    ),
  },
  {
    id: 'mudancas',
    title: 'Atualizações desta política',
    body: (
      <P>
        Esta política pode ser atualizada para acompanhar evoluções legais e operacionais. A versão
        vigente sempre estará disponível nesta página, com a data de última atualização no topo.
      </P>
    ),
  },
];

export default function DireitosAutoraisPage() {
  return (
    <LegalPage
      label="Direitos Autorais"
      title={
        <>
          Nosso conteúdo é{' '}
          <span style={{ color: '#fe0050' }}>protegido</span>, e isso protege você também
        </>
      }
      intro="A integridade do que publicamos sustenta a confiança do leitor. Por isso, regras claras sobre uso, citação, reprodução e denúncias, para autores, parceiros e quem encontrar nosso material onde não deveria estar."
      lastUpdated={LAST_UPDATED}
      sections={sections}
      contactSubject="Denúncia de direitos autorais"
      contactCta="Reportar uma violação"
    />
  );
}
