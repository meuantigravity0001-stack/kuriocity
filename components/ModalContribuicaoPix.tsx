'use client'

import { useState, useEffect } from 'react'
import { PontoDeCuidado } from '@/lib/types'
import { calcularSaldoDisponivel } from '@/lib/pix'
import { X, Copy, Check, Clock, ShieldCheck, QrCode, ArrowRight } from 'lucide-react'

interface ModalContribuicaoPixProps {
  ponto: PontoDeCuidado
  onClose: () => void
  onSuccess: () => void
}

export default function ModalContribuicaoPix({ ponto, onClose, onSuccess }: ModalContribuicaoPixProps) {
  const meta = ponto.orcamentoLoja?.valorTotal || 180
  const arrecadado = ponto.orcamentoLoja?.valorArrecadado || 120
  const disponivel = calcularSaldoDisponivel(meta, arrecadado, 0)

  const [valor, setValor] = useState<number>(Math.min(20, disponivel))
  const [colaboradorNome, setColaboradorNome] = useState('')
  const [loading, setLoading] = useState(false)
  const [pixGerado, setPixGerado] = useState<{
    qrCodePayload: string
    expiraEm: string
    chavePixDestino: string
  } | null>(null)
  const [copiado, setCopiado] = useState(false)
  const [tempoRestante, setTempoRestante] = useState(600) // 10 minutos (600s)

  useEffect(() => {
    if (!pixGerado) return
    const timer = setInterval(() => {
      setTempoRestante((t) => {
        if (t <= 1) {
          clearInterval(timer)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [pixGerado])

  const gerarPixReserva = async () => {
    if (valor <= 0 || valor > disponivel) return
    setLoading(true)
    try {
      const res = await fetch('/api/contribuicao-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pontoCuidadoId: ponto.id,
          colaboradorNome: colaboradorNome || 'Vizinho Colaborador',
          valor,
          chavePixDestino: ponto.orcamentoLoja?.chavePixLoja || '12.345.678/0001-90',
          nomeRecebedor: ponto.orcamentoLoja?.nomeLoja || 'Depósito do Bairro',
          cidadeRecebedor: ponto.cidade || 'Brasilia',
        }),
      })
      const data = await res.json()
      if (data.success) {
        setPixGerado({
          qrCodePayload: data.contribuicao.qrCodePayload,
          expiraEm: data.contribuicao.expiraEm,
          chavePixDestino: data.contribuicao.chavePixDestino,
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const copiarPix = () => {
    if (!pixGerado) return
    navigator.clipboard.writeText(pixGerado.qrCodePayload)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 3000)
  }

  const formatMinutosSegundos = (seg: number) => {
    const m = Math.floor(seg / 60)
    const s = seg % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-[#0d1117] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 bg-[#161b22]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-sm">
              💙
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Contribuição Pix Direto (P2P)</h3>
              <p className="text-gray-400 text-xs">Zero Custódia • Direto ao Lojista Local</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400">
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Card Destinatário */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3.5 space-y-2">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Lojista Parceiro Beneficiário</p>
            <p className="text-white font-bold text-sm">{ponto.orcamentoLoja?.nomeLoja || 'Depósito de Materiais Local'}</p>
            <p className="text-xs text-blue-400 font-mono">Chave Pix: {ponto.orcamentoLoja?.chavePixLoja}</p>
            <p className="text-[11px] text-gray-400 border-t border-gray-800/80 pt-2 mt-2">
              📦 <strong>Item:</strong> {ponto.orcamentoLoja?.itensDescricao || 'Materiais para zeladoria'}
            </p>
          </div>

          {!pixGerado ? (
            <div className="space-y-4">
              {/* Seleção de Valor */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Escolha o valor da contribuição (Disponível: R$ {disponivel.toFixed(2)})
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[10, 20, 50, Math.min(100, disponivel)].map((val) => (
                    <button
                      key={val}
                      type="button"
                      disabled={val > disponivel}
                      onClick={() => setValor(val)}
                      className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                        valor === val
                          ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                          : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-700 disabled:opacity-30'
                      }`}
                    >
                      R$ {val}
                    </button>
                  ))}
                </div>

                <input
                  type="number"
                  max={disponivel}
                  value={valor}
                  onChange={(e) => setValor(Number(e.target.value))}
                  placeholder="Ou digite outro valor..."
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Seu Nome ou Apelido (Opcional)
                </label>
                <input
                  type="text"
                  value={colaboradorNome}
                  onChange={(e) => setColaboradorNome(e.target.value)}
                  placeholder="Ex: Vizinho do Bloco B"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Aviso Custódia Zero */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex items-start gap-2 text-[11px] text-blue-300">
                <ShieldCheck size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Custódia Zero da Plataforma:</strong> Seu Pix vai direto para a conta do comerciante parceiro. A plataforma não retém nenhuma taxa.
                </div>
              </div>

              <button
                onClick={gerarPixReserva}
                disabled={loading || valor <= 0 || valor > disponivel}
                className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Gerar QR Code Pix Direto <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              {/* Timer de Reserva (Hold) */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <Clock size={16} className="animate-pulse" />
                  <span>Reserva Temporária Ativa (Hold)</span>
                </div>
                <span className="font-mono text-sm font-bold text-amber-300">
                  {formatMinutosSegundos(tempoRestante)}
                </span>
              </div>

              {/* Display QR Code */}
              <div className="bg-white p-4 rounded-xl inline-block shadow-lg mx-auto">
                <QrCode size={140} className="text-gray-900 mx-auto" />
              </div>

              <div className="space-y-2">
                <p className="text-xs text-gray-400">Copia e Cola no seu aplicativo do banco:</p>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-2.5 flex items-center gap-2 text-left">
                  <input
                    type="text"
                    readOnly
                    value={pixGerado.qrCodePayload}
                    className="bg-transparent text-[10px] font-mono text-gray-300 flex-1 truncate focus:outline-none"
                  />
                  <button
                    onClick={copiarPix}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0"
                  >
                    {copiado ? <Check size={14} /> : <Copy size={14} />}
                    {copiado ? 'Copiado!' : 'Copiar Pix'}
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  onSuccess()
                  onClose()
                }}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-gray-800 hover:bg-gray-700 text-gray-300"
              >
                Concluir e Voltar ao Tabuleiro
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
