import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return !!(url && key && !url.includes('seu-projeto') && !key.includes('sua-chave'))
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const ocorrenciaId = formData.get('ocorrenciaId') as string

    if (!file) {
      return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const ext = file.name.split('.').pop() || 'jpg'
        const fileName = `${ocorrenciaId || Date.now()}.${ext}`

        const { data, error } = await supabase.storage
          .from('ocorrencias-fotos')
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: true,
          })

        if (!error && data) {
          const { data: urlData } = supabase.storage
            .from('ocorrencias-fotos')
            .getPublicUrl(fileName)

          return NextResponse.json({ url: urlData.publicUrl, path: data.path })
        }
      } catch (e) {
        console.warn('[Upload] Erro Supabase storage, usando Data URL fallback:', e)
      }
    }

    // Fallback: Retornar Data URL Base64 para visualização local imediata
    const mimeType = file.type || 'image/jpeg'
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${mimeType};base64,${base64}`

    return NextResponse.json({ url: dataUrl, path: 'local-fallback' })
  } catch (err) {
    console.error('[Upload] Erro:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

