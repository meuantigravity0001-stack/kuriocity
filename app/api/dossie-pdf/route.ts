import { NextRequest, NextResponse } from 'next/server'
import { gerarDossieIPTU } from '@/lib/dossiePdf'
import { PontoDeCuidado } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const ponto: PontoDeCuidado = await req.json()
    const dossie = gerarDossieIPTU(ponto)
    return NextResponse.json(dossie)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro ao gerar Dossiê IPTU' }, { status: 500 })
  }
}
