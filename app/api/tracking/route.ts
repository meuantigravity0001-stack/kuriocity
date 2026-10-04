import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Tracking Pixel — detecta quando a prefeitura abriu o e-mail
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return new NextResponse(null, { status: 400 })
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Atualizar status da ocorrência para EM_COMBATE
    const { error } = await supabase
      .from('ocorrencias')
      .update({
        status: 'EM_COMBATE',
        email_lido: true,
        email_lido_em: new Date().toISOString(),
      })
      .eq('tracking_token', token)
      .eq('email_lido', false) // só atualiza se ainda não foi lido

    if (error) {
      console.error('[Tracking] Supabase error:', error)
    } else {
      console.log('[Tracking] E-mail aberto — token:', token)
    }
  } catch (err) {
    console.error('[Tracking] Erro:', err)
  }

  // Retorna pixel 1x1 transparente
  const pixel = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
  )

  return new NextResponse(pixel, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  })
}
