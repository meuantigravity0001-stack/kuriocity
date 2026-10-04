import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, pontoCuidadoId, latitude, longitude, fotoDriveUrl } = body

    if (action === 'checkin') {
      return NextResponse.json({
        success: true,
        message: 'Check-in de obra registrado com sucesso via GPS',
        checkInData: new Date().toISOString(),
        fotoAntesDriveUrl: fotoDriveUrl || 'https://drive.google.com/file/d/foto-antes',
        status: 'EM_EXECUCAO',
      })
    }

    if (action === 'checkout') {
      return NextResponse.json({
        success: true,
        message: 'Check-out concluído! Evidências enviadas para votação da vizinhança.',
        checkOutData: new Date().toISOString(),
        fotoDepoisDriveUrl: fotoDriveUrl || 'https://drive.google.com/file/d/foto-depois',
        status: 'AGUARDANDO_APROVACAO',
      })
    }

    if (action === 'votar') {
      return NextResponse.json({
        success: true,
        message: 'Voto registrado com sucesso! Obrigado por fortalecer a comunidade.',
        novoStatus: 'CONCLUIDO',
      })
    }

    return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro no Proof of Work' }, { status: 500 })
  }
}
