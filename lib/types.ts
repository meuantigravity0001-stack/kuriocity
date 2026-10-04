export type UserRole = 'CIDADAO' | 'COMERCIANTE' | 'PRESTADOR'
export type StatusPonto = 'ABERTO' | 'EM_ARRECADACAO' | 'EM_EXECUCAO' | 'CONCLUIDO'
export type StatusOrcamento = 'ARRECADANDO' | 'META_ATINGIDA' | 'ENTREGUE'
export type StatusServico = 'PENDENTE' | 'EM_EXECUCAO' | 'AGUARDANDO_APROVACAO' | 'APROVADO'

export interface User {
  id: string
  email: string
  nome: string
  telefone?: string
  endereco?: string
  chavePixPessoal?: string
  avatarUrl?: string
  role: UserRole // Perfil atualmente em uso no mapa
  
  // Perfis Adicionais Habilitados pelo Usuário (Evolução de Perfil)
  modoPrestadorAtivo?: boolean
  modoComercianteAtivo?: boolean
  
  googleDriveToken?: string
  driveFolderId?: string
  
  // Dados do Comerciante / Fornecedor
  nomeLoja?: string
  cnpj?: string
  chavePixLoja?: string
  enderecoLoja?: string
  cotacoesAtivasCount?: number
  
  // Dados do Prestador de Serviço
  especialidade?: string
  chavePixPrestador?: string
  avaliacaoMedia?: number
  obrasConcluidas?: number
  servicosEmAndamentoCount?: number // Usado para trava de desativação
}

export interface EtapaObra {
  id: string
  numero: number
  titulo: string
  descricao: string
  percentual: number // ex: 30%, 40%, 30%
  valorCalculado: number
  status: 'PENDENTE' | 'EM_EXECUCAO' | 'AGUARDANDO_APROVACAO' | 'APROVADO'
  fotoUrl?: string
  videoUrl?: string
  tipoEvidencia?: 'FOTO' | 'VIDEO'
  dataComprovação?: string
  votosAprovacao: number
}

export interface OrcamentoMaterial {
  id: string
  pontoCuidadoId: string
  nomeLoja: string
  chavePixLoja: string // Chave Pix Direta (CNPJ/E-mail/Telefone do Lojista)
  valorTotal: number
  valorArrecadado: number
  itensDescricao: string
  status: StatusOrcamento
}

export interface ServicoMaoDeObra {
  id: string
  pontoCuidadoId: string
  prestadorNome: string
  chavePixPrestador: string // Chave Pix Direta do Profissional
  valorAcordado: number
  reputacaoNivel: string
  checkInData?: string
  checkInLat?: number
  checkInLong?: number
  fotoAntesDriveUrl?: string
  fotoDepoisDriveUrl?: string
  status: StatusServico
  votosAprovacao: number
  prazoLimitePix?: string
  etapas?: EtapaObra[]
}

export interface ContribuicaoPix {
  id: string
  pontoCuidadoId: string
  colaboradorNome: string
  valor: number
  status: 'RESERVADO' | 'CONFIRMADO' | 'EXPIRADO'
  chavePixDestino: string
  qrCodePayload?: string
  expiraEm: string
  criadoEm: string
  etapaId?: string // Vincula à etapa liberada
}

export interface PontoDeCuidado {
  id: string
  titulo: string
  descricao: string
  latitude: number
  longitude: number
  endereco?: string
  cidade?: string
  status: StatusPonto
  driveFolderUrl?: string
  fotoUrl?: string
  categoria: string
  criadorNome?: string
  criadoEm: string
  atualizadoEm?: string
  orcamentoLoja?: OrcamentoMaterial
  servicoMaoObra?: ServicoMaoDeObra
  contribuicoes?: ContribuicaoPix[]
  votosAprovacao?: number
}

export interface ReverseGeocodeResult {
  enderecoFormatado: string
  cidade: string
  raw: string
}

export async function reverseGeocode(lat: number, lon: number): Promise<ReverseGeocodeResult> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'pt-BR' },
    })
    const data = await res.json()
    const addr = data.address || {}
    const road = addr.road || addr.pedestrian || addr.footway || 'Logradouro de Zeladoria'
    const number = addr.house_number ? `, ${addr.house_number}` : ''
    const district = addr.suburb || addr.neighbourhood || addr.city_district || ''
    const city = addr.city || addr.town || addr.village || addr.municipality || 'Cidade'
    const enderecoFormatado = `${road}${number}${district ? ' - ' + district : ''}`
    return { enderecoFormatado, cidade: city, raw: data.display_name || '' }
  } catch (e) {
    return {
      enderecoFormatado: `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`,
      cidade: 'Localidade Urbana',
      raw: '',
    }
  }
}

export function getStatusConfig(status: StatusPonto) {
  switch (status) {
    case 'ABERTO':
      return {
        color: '#dc2626',
        label: 'Ponto Mapeado',
        emoji: '🔴',
        badgeClass: 'bg-red-50 text-red-800 border-red-200 shadow-sm font-semibold',
        desc: 'Aguardando orçamento de materiais ou mão de obra local',
      }
    case 'EM_ARRECADACAO':
      return {
        color: '#2563eb',
        label: 'Em Arrecadação P2P',
        emoji: '🔵',
        badgeClass: 'bg-blue-50 text-blue-800 border-blue-200 shadow-sm font-semibold',
        desc: 'Comunidade contribuindo direto via Pix P2P ao Lojista ou Prestador',
      }
    case 'EM_EXECUCAO':
      return {
        color: '#d97706',
        label: 'Obra em Execução',
        emoji: '🟡',
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 shadow-sm font-semibold',
        desc: 'Prestador de Serviço em ação com comprovação por foto/vídeo',
      }
    case 'CONCLUIDO':
      return {
        color: '#16a34a',
        label: 'Vitória Comunitária',
        emoji: '🟢',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-sm font-semibold',
        desc: 'Manutenção realizada, comprovada e aprovada pelos vizinhos',
      }
  }
}

export function getRoleBadge(role: UserRole) {
  switch (role) {
    case 'CIDADAO':
      return {
        label: 'Morador / Cidadão',
        emoji: '🚶‍♂️',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      }
    case 'COMERCIANTE':
      return {
        label: 'Loja Parceira',
        emoji: '🏪',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      }
    case 'PRESTADOR':
      return {
        label: 'Mestre do Bairro',
        emoji: '🛠️',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      }
  }
}
