'use client'

import { useState, useCallback } from 'react'
import { cartasAutoridade } from '@/lib/cartas'
import { reverseGeocode } from '@/lib/types'
import CartaWar from './CartaWar'
import {
  Camera,
  MapPin,
  Send,
  X,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  Target,
} from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

interface MissaoModalProps {
  onClose: () => void
  onSuccess: () => void
}

type Step = 'camera' | 'localizacao' | 'carta' | 'confirmacao' | 'enviando' | 'sucesso'

export default function MissaoModal({ onClose, onSuccess }: MissaoModalProps) {
  const [step, setStep] = useState<Step>('camera')
  const [foto, setFoto] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [enderecoFormatado, setEnderecoFormatado] = useState('')
  const [cidade, setCidade] = useState('')
  const [cartaSelecionada, setCartaSelecionada] = useState<string | null>(null)
  const [legenda, setLegenda] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFoto(file)
    setFotoPreview(URL.createObjectURL(file))
  }

  const capturarLocalizacao = useCallback(async () => {
    setLoading(true)
    setErro(null)
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        })
      )
      const lat = pos.coords.latitude
      const lon = pos.coords.longitude
      setLatitude(lat)
      setLongitude(lon)

      const result = await reverseGeocode(lat, lon)
      setEnderecoFormatado(result.enderecoFormatado)
      setCidade(result.cidade)
      setStep('carta')
    } catch (err: any) {
      setErro('Não foi possível obter a localização. Verifique as permissões do GPS.')
    } finally {
      setLoading(false)
    }
  }, [])

  const enviarMissao = async () => {
    if (!foto || !latitude || !longitude || !cartaSelecionada) return
    setStep('enviando')
    setErro(null)

    try {
      const trackingToken = uuidv4()
      const ocorrenciaId = uuidv4()

      // 1. Upload da foto
      const formData = new FormData()
      formData.append('file', foto)
      formData.append('ocorrenciaId', ocorrenciaId)

      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
      const uploadData = await uploadRes.json()

      if (!uploadData.url) throw new Error('Falha no upload da foto')

      // 2. Criar ocorrência e enviar e-mail
      const res = await fetch('/api/ocorrencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude,
          longitude,
          enderecoFormatado,
          cidade,
          fotoUrl: uploadData.url,
          legenda,
          cartaId: cartaSelecionada,
          trackingToken,
        }),
      })

      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Erro ao enviar')

      setStep('sucesso')
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 3000)
    } catch (err: any) {
      setErro(err.message || 'Erro ao enviar missão')
      setStep('confirmacao')
    }
  }

  const cartaAtual = cartasAutoridade.find((c) => c.id === cartaSelecionada)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b border-gray-800"
          style={{
            background: 'linear-gradient(135deg, #0b132b 0%, #0d1117 100%)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center">
              <Target size={16} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-sm">🎯 Lançar Missão de Mapeamento</h2>
              <p className="text-gray-500 text-xs">
                {step === 'camera' && 'Passo 1 — Capture o problema'}
                {step === 'localizacao' && 'Passo 2 — Confirme a localização'}
                {step === 'carta' && 'Passo 3 — Selecione a Carta de Autoridade'}
                {step === 'confirmacao' && 'Passo 4 — Revisão e envio'}
                {step === 'enviando' && 'Enviando missão...'}
                {step === 'sucesso' && 'Missão lançada!'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* STEP 1: Câmera */}
          {step === 'camera' && (
            <div className="p-5 space-y-4">
              <label
                htmlFor="foto-input"
                className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed border-gray-700 hover:border-red-500/50 rounded-xl cursor-pointer transition-all bg-gray-900/50 hover:bg-gray-900 group"
              >
                {fotoPreview ? (
                  <img
                    src={fotoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="text-center">
                    <Camera size={36} className="text-gray-600 group-hover:text-red-400 transition-colors mx-auto mb-3" />
                    <p className="text-gray-400 text-sm font-medium">Toque para fotografar o problema</p>
                    <p className="text-gray-600 text-xs mt-1">Câmera traseira • Alta qualidade</p>
                  </div>
                )}
              </label>
              <input
                id="foto-input"
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFoto}
              />

              <textarea
                value={legenda}
                onChange={(e) => setLegenda(e.target.value)}
                placeholder="Descreva o problema brevemente (opcional)..."
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-red-500/50 transition-colors"
                rows={3}
              />

              <button
                disabled={!foto}
                onClick={() => setStep('localizacao')}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                style={
                  foto
                    ? { background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white' }
                    : { background: '#1f2937', color: '#6b7280' }
                }
              >
                Avançar — Capturar GPS
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* STEP 2: Localização */}
          {step === 'localizacao' && (
            <div className="p-5 space-y-4">
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin size={20} className="text-blue-400" />
                  <div>
                    <p className="text-white text-sm font-bold">Localização GPS</p>
                    <p className="text-gray-500 text-xs">Precisamos das coordenadas do problema</p>
                  </div>
                </div>

                {latitude && longitude ? (
                  <div className="space-y-2">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                      <p className="text-green-400 text-xs font-mono">✅ GPS capturado com sucesso</p>
                      <p className="text-gray-300 text-sm font-medium mt-1">{enderecoFormatado}</p>
                      <p className="text-gray-500 text-xs">{cidade}</p>
                      <p className="text-gray-600 text-xs font-mono mt-1">
                        {latitude.toFixed(6)}, {longitude.toFixed(6)}
                      </p>
                    </div>
                  </div>
                ) : null}

                {erro && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-400 text-xs">{erro}</p>
                  </div>
                )}
              </div>

              <button
                onClick={capturarLocalizacao}
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Capturando GPS...</>
                ) : latitude ? (
                  <><MapPin size={16} /> Recapturar GPS</>
                ) : (
                  <><MapPin size={16} /> Capturar Minha Localização</>
                )}
              </button>

              {latitude && (
                <button
                  onClick={() => setStep('carta')}
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white' }}
                >
                  Confirmar Endereço
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          )}

          {/* STEP 3: Seleção da Carta */}
          {step === 'carta' && (
            <div className="p-5 space-y-3">
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-4">
                🃏 Selecione a Carta do Responsável
              </p>

              {cartaSelecionada && cartaAtual ? (
                <>
                  <CartaWar carta={cartaAtual} />
                  <button
                    onClick={() => setCartaSelecionada(null)}
                    className="w-full py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    ← Trocar carta
                  </button>
                  <button
                    onClick={() => setStep('confirmacao')}
                    className="w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white' }}
                  >
                    Carta Selecionada — Avançar
                    <ChevronRight size={16} />
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  {cartasAutoridade.map((carta) => (
                    <CartaWar
                      key={carta.id}
                      carta={carta}
                      compact
                      isSelected={cartaSelecionada === carta.id}
                      onSelect={() => setCartaSelecionada(carta.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Confirmação */}
          {step === 'confirmacao' && (
            <div className="p-5 space-y-4">
              {/* Preview da foto */}
              {fotoPreview && (
                <div className="rounded-xl overflow-hidden border border-gray-800 h-32">
                  <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Resumo */}
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 space-y-3">
                <h3 className="text-white text-sm font-bold border-b border-gray-800 pb-2">
                  📋 Resumo da Missão
                </h3>
                <div>
                  <p className="text-gray-500 text-xs">Localização</p>
                  <p className="text-gray-200 text-sm">{enderecoFormatado}, {cidade}</p>
                </div>
                {cartaAtual && (
                  <div>
                    <p className="text-gray-500 text-xs">Autoridade Notificada</p>
                    <p className="text-gray-200 text-sm">
                      {cartaAtual.icone} {cartaAtual.orgaoResponsavel}
                    </p>
                    <p className="text-xs font-mono mt-1" style={{ color: cartaAtual.corTema }}>
                      {cartaAtual.emailOficial}
                    </p>
                  </div>
                )}
                {legenda && (
                  <div>
                    <p className="text-gray-500 text-xs">Descrição</p>
                    <p className="text-gray-200 text-sm">{legenda}</p>
                  </div>
                )}
              </div>

              {erro && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{erro}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('carta')}
                  className="flex-1 py-3 rounded-xl font-bold text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 transition-all flex items-center justify-center gap-2"
                >
                  <ChevronLeft size={16} /> Voltar
                </button>
                <button
                  onClick={enviarMissao}
                  className="flex-2 flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white' }}
                >
                  <Send size={16} /> Lançar Missão
                </button>
              </div>
            </div>
          )}

          {/* STEP: Enviando */}
          {step === 'enviando' && (
            <div className="p-10 flex flex-col items-center justify-center gap-6">
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-full border-4 border-gray-800 flex items-center justify-center"
                  style={{ borderTopColor: '#ef4444' }}
                >
                  <Loader2 size={28} className="text-red-500 animate-spin" />
                </div>
                <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-red-500" />
              </div>
              <div className="text-center">
                <p className="text-white font-bold">Transmitindo missão...</p>
                <p className="text-gray-500 text-sm mt-1">
                  Enviando alerta para a prefeitura via e-mail oficial
                </p>
              </div>
            </div>
          )}

          {/* STEP: Sucesso */}
          {step === 'sucesso' && (
            <div className="p-10 flex flex-col items-center justify-center gap-6">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #22c55e20, #16a34a20)', border: '2px solid #22c55e' }}
              >
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-lg">🎯 Missão Lançada!</p>
                <p className="text-gray-400 text-sm mt-2">
                  O e-mail oficial foi enviado. Você será notificado quando a prefeitura abrir a mensagem.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-full px-4 py-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-400 text-xs font-bold">🔴 ALERTA — Aguardando resposta da prefeitura</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
