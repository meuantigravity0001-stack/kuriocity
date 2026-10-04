import { NextRequest, NextResponse } from 'next/server'
import { gerarPayloadPixStatico } from '@/lib/pix'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      pontoCuidadoId,
      colaboradorNome,
      valor,
      chavePixDestino,
      nomeRecebedor,
      cidadeRecebedor,
    } = body

    if (!chavePixDestino || !valor || valor <= 0) {
      return NextResponse.json({ error: 'Dados Pix inválidos' }, { status: 400 })
    }

    const valorNum = Number(valor)
    const expiraEm = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 min hold timer

    // Gerar Payload EMV BR Code Pix P2P Direto (Sem custódia da plataforma)
    const qrCodePayload = gerarPayloadPixStatico({
      chavePix: chavePixDestino,
      nomeRecebedor: nomeRecebedor || 'Lojista Parceiro',
      cidadeRecebedor: cidadeRecebedor || 'Brasilia',
      valor: valorNum,
      txid: `KURIOCITY${pontoCuidadoId.substring(0, 5).toUpperCase()}`,
    })

    const contribuicao = {
      id: `pix-${Date.now()}`,
      pontoCuidadoId,
      colaboradorNome: colaboradorNome || 'Vizinho Colaborador',
      valor: valorNum,
      status: 'RESERVADO',
      chavePixDestino,
      qrCodePayload,
      expiraEm,
      criadoEm: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      contribuicao,
      holdSegundos: 600, // 10 minutos
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro ao processar reserva Pix' }, { status: 500 })
  }
}
