// Cartas de Zeladoria Colaborativa & Parceiros do Bairro — Kurió City Tour
export interface CartaParceiro {
  id: string
  categoria: string
  orgaoResponsavel: string // Ou Lojista/Parceiro do Bairro
  cargoPolitico: string
  emailOficial: string
  descricaoPapel: string
  corTema: string
  icone: string
  lojaParceiraExemplo: string
  chavePixExemplo: string
}

export type CartaAutoridade = CartaParceiro

export const cartasAutoridade: CartaParceiro[] = [
  {
    id: 'obras',
    categoria: 'Reparo de Calçada / Buraco Urbano',
    orgaoResponsavel: 'Depósito & Material de Construção do Bairro',
    cargoPolitico: 'Parceiro Comercial Local',
    emailOficial: 'contato@depositoexemplo.com.br',
    descricaoPapel:
      'Fornece sacos de cimento, areia e piso tátil a preço de custo comunitário. Recebimento direto Pix P2P.',
    corTema: '#f97316',
    icone: '🧱',
    lojaParceiraExemplo: 'Depósito São José — Construção & Tintas',
    chavePixExemplo: '12.345.678/0001-90',
  },
  {
    id: 'iluminacao',
    categoria: 'Iluminação de Vizinhança / Refletor',
    orgaoResponsavel: 'Eletrônica & Elétrica do Bairro',
    cargoPolitico: 'Parceiro Comercial Local',
    emailOficial: 'vendas@eletricadosamigos.com.br',
    descricaoPapel:
      'Fornece refletores LED comunitários, lâmpadas e fotocélulas com garantia local. Recebimento direto Pix P2P.',
    corTema: '#eab308',
    icone: '💡',
    lojaParceiraExemplo: 'Elétrica & Iluminação Central',
    chavePixExemplo: 'pix@eletricacentral.com.br',
  },
  {
    id: 'lixo',
    categoria: 'Limpeza / Revitalização de Lixeira',
    orgaoResponsavel: 'Cooperativa de Reciclagem & Jardinagem',
    cargoPolitico: 'Zeladoria Comunitária',
    emailOficial: 'contato@cooperativaeco.org.br',
    descricaoPapel:
      'Fornece lixeiras comunitárias de ferro reforçado e mudas para floreiras de calçada. Recebimento direto Pix P2P.',
    corTema: '#22c55e',
    icone: '🌱',
    lojaParceiraExemplo: 'EcoVerde Ferragens & Jardinagem',
    chavePixExemplo: 'ecoverde@pix.com.br',
  },
  {
    id: 'esgoto',
    categoria: 'Drenagem / Reparo de Grelha de Bueiro',
    orgaoResponsavel: 'Serralheria & Materiais Hidráulicos',
    cargoPolitico: 'Parceiro Comercial Local',
    emailOficial: 'serralheria@bairro.com.br',
    descricaoPapel:
      'Fabrica grelhas metálicas sob medida para conter resíduos e evitar alagamentos em dias de chuva. Pix P2P direto.',
    corTema: '#06b6d4',
    icone: '🚰',
    lojaParceiraExemplo: 'Serralheria & Hidráulica Mestre Silva',
    chavePixExemplo: '98765432100',
  },
  {
    id: 'arvore',
    categoria: 'Poda de Proteção / Canteiro Vivo',
    orgaoResponsavel: 'Horta Comunitária & Jardinagem',
    cargoPolitico: 'Zeladoria Verde',
    emailOficial: 'horta.bairro@gmail.com',
    descricaoPapel:
      'Poda preventiva e proteção de canteiros com apoio de moradores e paisagistas locais. Pix P2P direto.',
    corTema: '#84cc16',
    icone: '🌳',
    lojaParceiraExemplo: 'Viveiro & Jardinagem Florescer',
    chavePixExemplo: 'florescer@pix.org',
  },
  {
    id: 'seguranca',
    categoria: 'Sinalização / Pintura de Faixa',
    orgaoResponsavel: 'Casa das Tintas & Comunicação Visual',
    cargoPolitico: 'Parceiro Comercial Local',
    emailOficial: 'tintas@vizinhanca.com',
    descricaoPapel:
      'Fornece tinta viária refletiva para demarcação de lombadas e travessia segura de pedestres. Pix P2P direto.',
    corTema: '#8b5cf6',
    icone: '🛑',
    lojaParceiraExemplo: 'Casa das Tintas & Ferramentas',
    chavePixExemplo: 'tintas@pixcomercio.com.br',
  },
]

export function getCartaPorCategoria(categoriaId: string): CartaParceiro | undefined {
  return cartasAutoridade.find((c) => c.id === categoriaId)
}
