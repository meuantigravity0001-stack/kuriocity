import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { cartasAutoridade } from '@/lib/cartas'

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder')

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return !!(url && key && !url.includes('seu-projeto') && !key.includes('sua-chave'))
}

// Em-memória fallback para demonstração sem Supabase configurado
const inMemoryOcorrencias: any[] = [
  {
    id: 'mock-1',
    latitude: -15.7942,
    longitude: -47.8822,
    enderecoFormatado: 'Quadra 102 Sul, Asa Sul',
    cidade: 'Brasília - DF',
    fotoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop',
    legenda: 'Poste apagado há 3 dias perto da escola infantil.',
    cartaId: 'iluminacao',
    status: 'EM_COMBATE',
    emailEnviado: true,
    emailLido: true,
    emailLidoEm: new Date(Date.now() - 3600000).toISOString(),
    trackingToken: 'token-mock-1',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'mock-2',
    latitude: -23.5615,
    longitude: -46.6559,
    enderecoFormatado: 'Av. Paulista, 1578 - Bela Vista',
    cidade: 'São Paulo - SP',
    fotoUrl: 'https://images.unsplash.com/photo-1584463674643-87b64082c59a?w=600&auto=format&fit=crop',
    legenda: 'Buraco gigante na faixa da direita causando risco a ciclistas e motos.',
    cartaId: 'obras',
    status: 'ALERTA',
    emailEnviado: true,
    emailLido: false,
    trackingToken: 'token-mock-2',
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 'mock-3',
    latitude: -22.9068,
    longitude: -43.1729,
    enderecoFormatado: 'Rua da Assembleia, 10 - Centro',
    cidade: 'Rio de Janeiro - RJ',
    fotoUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop',
    legenda: 'Acúmulo de lixo e entulho na calçada impedindo pedestres.',
    cartaId: 'lixo',
    status: 'RESOLVIDO',
    emailEnviado: true,
    emailLido: true,
    emailLidoEm: new Date(Date.now() - 86400000).toISOString(),
    trackingToken: 'token-mock-3',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'mock-4',
    latitude: -19.9167,
    longitude: -43.9345,
    enderecoFormatado: 'Av. Afonso Pena, 1200 - Centro',
    cidade: 'Belo Horizonte - MG',
    fotoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=600&auto=format&fit=crop',
    legenda: 'Vazamento de esgoto com forte odor em frente ao comércio.',
    cartaId: 'esgoto',
    status: 'ALERTA',
    emailEnviado: true,
    emailLido: false,
    trackingToken: 'token-mock-4',
    createdAt: new Date(Date.now() - 21600000).toISOString(),
  },
]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      latitude,
      longitude,
      enderecoFormatado,
      cidade,
      fotoUrl,
      legenda,
      cartaId,
      userId,
      trackingToken,
    } = body

    const carta = cartasAutoridade.find((c) => c.id === cartaId)
    if (!carta) {
      return NextResponse.json({ error: 'Carta não encontrada' }, { status: 400 })
    }

    let ocorrencia: any = null

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { data, error: dbError } = await supabase
          .from('ocorrencias')
          .insert({
            user_id: userId || null,
            latitude,
            longitude,
            endereco_formatado: enderecoFormatado,
            cidade,
            foto_url: fotoUrl,
            legenda: legenda || null,
            carta_id: cartaId,
            status: 'ALERTA',
            email_enviado: false,
            email_lido: false,
            tracking_token: trackingToken,
          })
          .select()
          .single()

        if (!dbError && data) {
          ocorrencia = {
            id: data.id,
            latitude: data.latitude,
            longitude: data.longitude,
            enderecoFormatado: data.endereco_formatado,
            cidade: data.cidade,
            fotoUrl: data.foto_url,
            legenda: data.legenda,
            cartaId: data.carta_id,
            status: data.status,
            emailEnviado: data.email_enviado,
            emailLido: data.email_lido,
            emailLidoEm: data.email_lido_em,
            trackingToken: data.tracking_token,
            createdAt: data.created_at,
          }
        }
      } catch (err) {
        console.warn('[Ocorrencia] Erro ao conectar Supabase, usando fallback in-memory:', err)
      }
    }

    if (!ocorrencia) {
      const id = `loc-${Date.now()}`
      ocorrencia = {
        id,
        userId: userId || null,
        latitude,
        longitude,
        enderecoFormatado,
        cidade,
        fotoUrl,
        legenda: legenda || null,
        cartaId,
        status: 'ALERTA',
        emailEnviado: false,
        emailLido: false,
        trackingToken,
        createdAt: new Date().toISOString(),
      }
      inMemoryOcorrencias.unshift(ocorrencia)
    }

    // 2. Montar e-mail de notificação para a prefeitura
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const trackingPixelUrl = `${appUrl}/api/tracking?token=${trackingToken}`
    const mapLink = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=18/${latitude}/${longitude}`
    const dataHora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })

    const emailHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background: #0d1117; color: #e2e8f0; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #161b22; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #0b132b 0%, #1c2a4a 100%); padding: 32px; text-align: center; border-bottom: 2px solid ${carta.corTema}; }
    .header h1 { color: ${carta.corTema}; font-size: 22px; margin: 0; letter-spacing: 2px; text-transform: uppercase; }
    .header p { color: #94a3b8; margin: 8px 0 0; font-size: 13px; }
    .card { margin: 24px; background: #1e2a3a; border-radius: 10px; border-left: 4px solid ${carta.corTema}; padding: 20px; }
    .card-title { color: ${carta.corTema}; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 8px; }
    .card-body { color: #e2e8f0; font-size: 15px; margin: 0; }
    .field { margin: 16px 24px; }
    .field-label { color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
    .field-value { color: #e2e8f0; font-size: 14px; }
    .foto-container { margin: 0 24px 24px; border-radius: 8px; overflow: hidden; border: 1px solid #2d3748; }
    .foto-container img { width: 100%; display: block; }
    .map-btn { display: block; background: ${carta.corTema}; color: white; text-decoration: none; text-align: center; padding: 12px; border-radius: 8px; margin: 0 24px 24px; font-weight: bold; font-size: 14px; }
    .footer { background: #0d1117; padding: 20px 24px; text-align: center; }
    .footer p { color: #475569; font-size: 11px; margin: 4px 0; }
    .badge { display: inline-block; background: #ef444420; color: #ef4444; border: 1px solid #ef4444; border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: bold; margin-top: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚔️ WAR URBANO — Notificação Cívica Oficial</h1>
      <p>Sistema de Zeladoria Cidadã | Reporte #${ocorrencia.id.substring(0, 8).toUpperCase()}</p>
      <div class="badge">🔴 STATUS: EM ALERTA</div>
    </div>

    <div class="card">
      <p class="card-title">${carta.icone} Órgão Notificado</p>
      <p class="card-body">${carta.orgaoResponsavel}</p>
    </div>

    <div class="field">
      <div class="field-label">Categoria do Problema</div>
      <div class="field-value">${carta.categoria}</div>
    </div>

    <div class="field">
      <div class="field-label">📍 Endereço Exato</div>
      <div class="field-value">${enderecoFormatado}, ${cidade}</div>
    </div>

    <div class="field">
      <div class="field-label">🗺️ Coordenadas GPS</div>
      <div class="field-value">Lat: ${latitude.toFixed(6)} | Lon: ${longitude.toFixed(6)}</div>
    </div>

    <div class="field">
      <div class="field-label">🕐 Data e Hora do Reporte</div>
      <div class="field-value">${dataHora}</div>
    </div>

    ${legenda ? `<div class="field"><div class="field-label">💬 Descrição do Cidadão</div><div class="field-value">${legenda}</div></div>` : ''}

    ${fotoUrl ? `<div class="foto-container"><img src="${fotoUrl}" alt="Foto do problema reportado" /></div>` : ''}

    <a href="${mapLink}" class="map-btn">🗺️ Ver Localização no Mapa</a>

    <div class="footer">
      <p>Este e-mail é uma notificação automática gerada pelo sistema WAR URBANO — Zeladoria Cidadã.</p>
      <p>Responsabilidade legal: ${carta.descricaoPapel}</p>
      <p>Administração: ${process.env.ADMIN_EMAIL || 'admin@warurbano.local'}</p>
      <p style="color: #1e2a3a;">ID: ${ocorrencia.id}</p>
    </div>
  </div>

  <!-- Tracking Pixel -->
  <img src="${trackingPixelUrl}" width="1" height="1" style="display:none" alt="" />
</body>
</html>`

    let emailEnviado = false
    if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('123456')) {
      try {
        const emailTo = [carta.emailOficial, process.env.ADMIN_EMAIL].filter(Boolean) as string[]
        const { error: emailError } = await resend.emails.send({
          from: `WAR URBANO Zeladoria <${process.env.ADMIN_EMAIL || 'notificacao@resend.dev'}>`,
          to: emailTo,
          subject: `⚠️ [ALERTA CÍVICO] ${carta.categoria} — ${enderecoFormatado}, ${cidade}`,
          html: emailHtml,
        })
        emailEnviado = !emailError
      } catch (e) {
        console.warn('[Email] Erro ao enviar email Resend:', e)
      }
    }

    ocorrencia.emailEnviado = emailEnviado

    return NextResponse.json({
      success: true,
      id: ocorrencia.id,
      ocorrencia,
      emailEnviado,
    })
  } catch (err) {
    console.error('[Ocorrencia] Erro geral:', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { data, error } = await supabase
          .from('ocorrencias')
          .select('*, cartas_autoridade(*)')
          .order('created_at', { ascending: false })
          .limit(200)

        if (!error && data && data.length > 0) {
          const ocorrencias = data.map((d: any) => ({
            id: d.id,
            latitude: d.latitude,
            longitude: d.longitude,
            enderecoFormatado: d.endereco_formatado,
            cidade: d.cidade,
            fotoUrl: d.foto_url,
            legenda: d.legenda,
            cartaId: d.carta_id,
            status: d.status,
            emailEnviado: d.email_enviado,
            emailLido: d.email_lido,
            emailLidoEm: d.email_lido_em,
            trackingToken: d.tracking_token,
            createdAt: d.created_at,
          }))
          return NextResponse.json({ ocorrencias })
        }
      } catch (err) {
        console.warn('[GET Ocorrencias] Supabase fallback para in-memory:', err)
      }
    }

    return NextResponse.json({ ocorrencias: inMemoryOcorrencias })
  } catch (err) {
    console.error('[GET Ocorrencias] Erro:', err)
    return NextResponse.json({ ocorrencias: inMemoryOcorrencias })
  }
}

