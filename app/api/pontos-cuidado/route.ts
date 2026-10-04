import { NextRequest, NextResponse } from 'next/server'
import { PontoDeCuidado } from '@/lib/types'

// Pontos de Cuidado Iniciais (Demonstração Rua Legal 2.0)
const pontosEmMemoria: PontoDeCuidado[] = [
  {
    id: 'ponto-1',
    titulo: 'Reparo de Calçada & Piso Tátil',
    descricao: 'Calçada quebrada com risco de queda de idosos na esquina da farmácia.',
    latitude: -15.7942,
    longitude: -47.8822,
    endereco: 'Quadra 102 Sul, Bloco A',
    cidade: 'Brasília - DF',
    status: 'EM_ARRECADACAO',
    categoria: 'Reparo de Calçada / Buraco Urbano',
    fotoUrl: 'https://images.unsplash.com/photo-1584463674643-87b64082c59a?w=600&auto=format&fit=crop',
    driveFolderUrl: 'https://drive.google.com/drive/folders/rua-legal-ponto-1',
    criadorNome: 'Dona Maria (Moradora)',
    criadoEm: new Date(Date.now() - 3600000 * 5).toISOString(),
    orcamentoLoja: {
      id: 'orc-1',
      pontoCuidadoId: 'ponto-1',
      nomeLoja: 'Depósito São José — Construção & Tintas',
      chavePixLoja: '12.345.678/0001-90',
      valorTotal: 180.0,
      valorArrecadado: 120.0,
      itensDescricao: '2x Sacos Cimento Mauá (R$ 70), 4x Sacos Areia (R$ 60), 2x Pisos Tátil (R$ 50)',
      status: 'ARRECADANDO',
    },
    servicoMaoObra: {
      id: 'serv-1',
      pontoCuidadoId: 'ponto-1',
      prestadorNome: 'Seu Raimundo (Pedreiro do Bairro)',
      chavePixPrestador: '987.654.321-00',
      valorAcordado: 120.0,
      reputacaoNivel: 'Mestre do Bairro - Nível 4 ⭐⭐⭐⭐',
      status: 'PENDENTE',
      votosAprovacao: 8,
    },
  },
  {
    id: 'ponto-2',
    titulo: 'Refletor LED Comunitário no Beco',
    descricao: 'Iluminação de segurança para a travessia noturna dos moradores e estudantes.',
    latitude: -23.5615,
    longitude: -46.6559,
    endereco: 'Av. Paulista, 1578',
    cidade: 'São Paulo - SP',
    status: 'EM_EXECUCAO',
    categoria: 'Iluminação de Vizinhança / Refletor',
    fotoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop',
    driveFolderUrl: 'https://drive.google.com/drive/folders/rua-legal-ponto-2',
    criadorNome: 'Lucas (Comerciante Local)',
    criadoEm: new Date(Date.now() - 3600000 * 24).toISOString(),
    orcamentoLoja: {
      id: 'orc-2',
      pontoCuidadoId: 'ponto-2',
      nomeLoja: 'Elétrica & Iluminação Central',
      chavePixLoja: 'pix@eletricacentral.com.br',
      valorTotal: 140.0,
      valorArrecadado: 140.0,
      itensDescricao: '1x Refletor LED 100W IP66 (R$ 90), 10m Fio Paralelo + Fotocélula (R$ 50)',
      status: 'META_ATINGIDA',
    },
    servicoMaoObra: {
      id: 'serv-2',
      pontoCuidadoId: 'ponto-2',
      prestadorNome: 'Carlos Eletricista',
      chavePixPrestador: 'carloseletrica@pix.com',
      valorAcordado: 90.0,
      reputacaoNivel: 'Mestre do Bairro - Nível 5 ⭐⭐⭐⭐⭐',
      status: 'EM_EXECUCAO',
      checkInData: new Date(Date.now() - 3600000 * 2).toISOString(),
      checkInLat: -23.5615,
      checkInLong: -46.6559,
      fotoAntesDriveUrl: 'https://drive.google.com/file/d/foto-antes',
      votosAprovacao: 15,
    },
  },
  {
    id: 'ponto-3',
    titulo: 'Vitória Comunitária: Horta & Lixeira Reforçada',
    descricao: 'Revitalização completa do canteiro com lixeira de ferro e flores de vizinhança.',
    latitude: -22.9068,
    longitude: -43.1729,
    endereco: 'Rua da Assembleia, 10 - Centro',
    cidade: 'Rio de Janeiro - RJ',
    status: 'CONCLUIDO',
    categoria: 'Limpeza / Revitalização de Lixeira',
    fotoUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop',
    driveFolderUrl: 'https://drive.google.com/drive/folders/rua-legal-ponto-3',
    criadorNome: 'Associação de Moradores',
    criadoEm: new Date(Date.now() - 3600000 * 72).toISOString(),
    orcamentoLoja: {
      id: 'orc-3',
      pontoCuidadoId: 'ponto-3',
      nomeLoja: 'EcoVerde Ferragens & Jardinagem',
      chavePixLoja: 'ecoverde@pix.com.br',
      valorTotal: 220.0,
      valorArrecadado: 220.0,
      itensDescricao: 'Lixeira Basculante Metálica (R$ 160), Mudas e Terra Vegetal (R$ 60)',
      status: 'ENTREGUE',
    },
    servicoMaoObra: {
      id: 'serv-3',
      pontoCuidadoId: 'ponto-3',
      prestadorNome: 'Jorge Jardinagem & Solda',
      chavePixPrestador: 'jorgejardinagem@pix.com',
      valorAcordado: 110.0,
      reputacaoNivel: 'Mestre do Bairro - Nível 5 ⭐⭐⭐⭐⭐',
      status: 'APROVADO',
      fotoAntesDriveUrl: 'https://drive.google.com/file/d/foto-antes-3',
      fotoDepoisDriveUrl: 'https://drive.google.com/file/d/foto-depois-3',
      votosAprovacao: 24,
    },
  },
]

export async function GET() {
  return NextResponse.json({ pontos: pontosEmMemoria })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      titulo,
      descricao,
      latitude,
      longitude,
      endereco,
      cidade,
      categoria,
      fotoUrl,
      driveFolderUrl,
      nomeLoja,
      chavePixLoja,
      valorMaterial,
      itensDescricao,
      prestadorNome,
      chavePixPrestador,
      valorMaoObra,
    } = body

    const id = `ponto-${Date.now()}`

    const novoPonto: PontoDeCuidado = {
      id,
      titulo: titulo || 'Missão de Zeladoria',
      descricao: descricao || 'Ponto de cuidado mapeado pela vizinhança',
      latitude: Number(latitude),
      longitude: Number(longitude),
      endereco: endereco || 'Logradouro de Zeladoria',
      cidade: cidade || 'Cidade Local',
      categoria: categoria || 'Reparo de Calçada / Buraco Urbano',
      fotoUrl: fotoUrl || 'https://images.unsplash.com/photo-1584463674643-87b64082c59a?w=600&auto=format&fit=crop',
      driveFolderUrl: driveFolderUrl || `https://drive.google.com/drive/folders/kuriocity-${id}`,
      status: nomeLoja ? 'EM_ARRECADACAO' : 'ABERTO',
      criadorNome: 'Cidadão Colaborador',
      criadoEm: new Date().toISOString(),
    }

    if (nomeLoja && chavePixLoja) {
      novoPonto.orcamentoLoja = {
        id: `orc-${Date.now()}`,
        pontoCuidadoId: id,
        nomeLoja,
        chavePixLoja,
        valorTotal: Number(valorMaterial) || 150,
        valorArrecadado: 0,
        itensDescricao: itensDescricao || 'Materiais para a zeladoria',
        status: 'ARRECADANDO',
      }
    }

    if (prestadorNome && chavePixPrestador) {
      novoPonto.servicoMaoObra = {
        id: `serv-${Date.now()}`,
        pontoCuidadoId: id,
        prestadorNome,
        chavePixPrestador,
        valorAcordado: Number(valorMaoObra) || 100,
        reputacaoNivel: 'Mestre do Bairro - Nível 1 ⭐',
        status: 'PENDENTE',
        votosAprovacao: 0,
      }
    }

    pontosEmMemoria.unshift(novoPonto)

    return NextResponse.json({ success: true, ponto: novoPonto })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro ao criar ponto de cuidado' }, { status: 500 })
  }
}
