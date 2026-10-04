'use client'

import { useState } from 'react'
import { PontoDeCuidado, EtapaObra } from '@/lib/types'
import {
  HardHat,
  X,
  MapPin,
  Camera,
  Video,
  ThumbsUp,
  CheckCircle2,
  Award,
  Loader2,
  FolderLock,
  Coins,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Play,
} from 'lucide-react'

interface ModalProofOfWorkProps {
  ponto: PontoDeCuidado
  onClose: () => void
  onSuccess: () => void
}

export default function ModalProofOfWork({ ponto, onClose, onSuccess }: ModalProofOfWorkProps) {
  const servico = ponto.servicoMaoObra
  const valorTotal = servico?.valorAcordado || 420.0

  // Etapas de Execução Padrão
  const [etapas, setEtapas] = useState<EtapaObra[]>(
    servico?.etapas || [
      {
        id: 'etapa-1',
        numero: 1,
        titulo: 'Etapa 1: Preparação & Limpeza do Local',
        descricao: 'Demarcação GPS, limpeza dos entulhos e transporte de ferramentas.',
        percentual: 30,
        valorCalculado: valorTotal * 0.3,
        status: 'APROVADO',
        fotoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&auto=format&fit=crop&q=80',
        tipoEvidencia: 'FOTO',
        votosAprovacao: 8,
      },
      {
        id: 'etapa-2',
        numero: 2,
        titulo: 'Etapa 2: Aplicação do Cimento & Nivelamento',
        descricao: 'Assentamento das pedras e aplicação da argamassa de alta resistência.',
        percentual: 40,
        valorCalculado: valorTotal * 0.4,
        status: 'EM_EXECUCAO',
        votosAprovacao: 3,
      },
      {
        id: 'etapa-3',
        numero: 3,
        titulo: 'Etapa 3: Acabamento, Pintura & Entrega',
        descricao: 'Pintura da guia de proteção, selagem e varrição final do calçamento.',
        percentual: 30,
        valorCalculado: valorTotal * 0.3,
        status: 'PENDENTE',
        votosAprovacao: 0,
      },
    ]
  )

  const [loading, setLoading] = useState(false)
  const [etapaSelecionada, setEtapaSelecionada] = useState<EtapaObra>(etapas[1])
  const [tipoEvidencia, setTipoEvidencia] = useState<'FOTO' | 'VIDEO'>('FOTO')
  const [midiaSimulada, setMidiaSimulada] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [modalPixEtapa, setModalPixEtapa] = useState<EtapaObra | null>(null)

  // Enviar comprovação de Etapa (Foto ou Vídeo)
  const handleEnviarComprovacao = (etapaId: string) => {
    setLoading(true)
    setTimeout(() => {
      setEtapas((prev) =>
        prev.map((e) => {
          if (e.id === etapaId) {
            return {
              ...e,
              status: 'AGUARDANDO_APROVACAO',
              tipoEvidencia,
              fotoUrl: tipoEvidencia === 'FOTO' ? 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&auto=format&fit=crop&q=80' : undefined,
              videoUrl: tipoEvidencia === 'VIDEO' ? 'https://assets.mixkit.co/videos/preview/mixkit-construction-worker-working-with-concrete-41584-large.mp4' : undefined,
              dataComprovação: new Date().toLocaleDateString('pt-BR'),
            }
          }
          return e
        })
      )
      setMensagem(`✅ Evidência (${tipoEvidencia}) enviada com sucesso para aprovação comunitária!`)
      setLoading(false)
    }, 1200)
  }

  // Votar / Aprovar Etapa
  const handleVotarEtapa = (etapaId: string) => {
    setLoading(true)
    setTimeout(() => {
      setEtapas((prev) =>
        prev.map((e) => {
          if (e.id === etapaId) {
            const novosVotos = e.votosAprovacao + 1
            const aprovado = novosVotos >= 4
            return {
              ...e,
              votosAprovacao: novosVotos,
              status: aprovado ? 'APROVADO' : 'AGUARDANDO_APROVACAO',
            }
          }
          return e
        })
      )
      setMensagem('⭐ Seu voto de vizinho foi contabilizado! A comunidade está validando a etapa.')
      setLoading(false)
    }, 800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl my-8">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-amber-500/20">
              👷
            </div>
            <div>
              <h3 className="text-slate-900 font-extrabold text-base leading-snug">Execução por Etapas & Pix Liberado</h3>
              <p className="text-slate-500 text-xs font-semibold">Comprovação por Foto/Vídeo + Pagamento Gradual</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-200/80 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6">

          {/* DADOS DO PRESTADOR E VALOR TOTAL */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Profissional Responsável</span>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/30">
                  {servico?.reputacaoNivel || 'Mestre do Bairro'}
                </span>
              </div>
              <h4 className="text-lg font-black text-white mt-1">{servico?.prestadorNome || 'Seu Raimundo (Pedreiro do Bairro)'}</h4>
              <p className="text-xs text-slate-400 mt-0.5">Chave Pix: <span className="font-mono text-slate-200">{servico?.chavePixPrestador || '11987654321'}</span></p>
            </div>
            <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 text-right w-full sm:w-auto">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Valor Total da Mão de Obra</p>
              <p className="text-2xl font-black text-emerald-400">R$ {valorTotal.toFixed(2)}</p>
            </div>
          </div>

          {/* LISTA DE ETAPAS DE EXECUÇÃO */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Etapas de Trabalho (Liberação Gradual Pix)</h4>
              <span className="text-xs font-bold text-blue-600">3 Etapas Cadastradas</span>
            </div>

            <div className="space-y-3">
              {etapas.map((etapa) => {
                const isAprovado = etapa.status === 'APROVADO'
                const isEmAnalise = etapa.status === 'AGUARDANDO_APROVACAO'

                return (
                  <div
                    key={etapa.id}
                    className={`border rounded-2xl p-4 sm:p-5 transition-all ${
                      isAprovado
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : isEmAnalise
                        ? 'bg-blue-50/60 border-blue-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900">{etapa.titulo}</span>
                          <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-white border text-slate-700 shadow-xs">
                            {etapa.percentual}% do Total
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{etapa.descricao}</p>
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        <span className="text-xs text-slate-400 font-bold block">Valor desta Etapa</span>
                        <span className="text-lg font-black text-slate-900">R$ {etapa.valorCalculado.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* STATUS E MÍDIA DA ETAPA */}
                    <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      
                      {/* EVIDÊNCIA DE MÍDIA */}
                      <div className="flex items-center gap-3">
                        {etapa.fotoUrl && (
                          <div className="relative group rounded-xl overflow-hidden border border-slate-300 w-12 h-12 shrink-0">
                            <img src={etapa.fotoUrl} alt={etapa.titulo} className="w-full h-full object-cover" />
                            <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white font-bold text-center py-0.5">FOTO</span>
                          </div>
                        )}

                        {etapa.videoUrl && (
                          <div className="relative rounded-xl overflow-hidden border border-slate-300 w-12 h-12 bg-slate-900 flex items-center justify-center shrink-0">
                            <Video size={18} className="text-blue-400" />
                            <span className="absolute bottom-0 inset-x-0 bg-blue-600 text-[9px] text-white font-bold text-center py-0.5">VÍDEO</span>
                          </div>
                        )}

                        <div>
                          {isAprovado ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                              <CheckCircle2 size={14} /> Etapa Concluída & Pix Liberado!
                            </span>
                          ) : isEmAnalise ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg">
                              <ShieldCheck size={14} /> Comprovação enviada ({etapa.votosAprovacao}/4 votos vizinhos)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-200 px-2.5 py-1 rounded-lg">
                              Aguardando execução do prestador
                            </span>
                          )}
                        </div>
                      </div>

                      {/* AÇÕES (COMPROVAR OU LIBERAR PIX) */}
                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        {!isAprovado && (
                          <div className="flex items-center gap-1.5">
                            {/* SELETOR FOTO OU VÍDEO */}
                            <select
                              value={tipoEvidencia}
                              onChange={(e) => setTipoEvidencia(e.target.value as 'FOTO' | 'VIDEO')}
                              className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-700"
                            >
                              <option value="FOTO">📷 Foto</option>
                              <option value="VIDEO">🎥 Vídeo</option>
                            </select>

                            <button
                              onClick={() => handleEnviarComprovacao(etapa.id)}
                              disabled={loading}
                              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all"
                            >
                              Enviar Evidência
                            </button>
                          </div>
                        )}

                        {isEmAnalise && !isAprovado && (
                          <button
                            onClick={() => handleVotarEtapa(etapa.id)}
                            disabled={loading}
                            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1"
                          >
                            <ThumbsUp size={13} />
                            <span>Aprovar (Vizinho)</span>
                          </button>
                        )}

                        {isAprovado && (
                          <button
                            onClick={() => setModalPixEtapa(etapa)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5"
                          >
                            <QrCode size={14} />
                            <span>Pagar Etapa (R$ {etapa.valorCalculado.toFixed(2)})</span>
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {mensagem && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-3.5 text-center text-xs font-extrabold animate-slide-up">
              {mensagem}
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-slate-600">
            <FolderLock size={18} className="text-blue-600 shrink-0" />
            <span>
              Todas as fotos e vídeos comprovatórios são salvos na pasta pública do Google Drive do morador e integrados ao Dossiê Cívico IPTU.
            </span>
          </div>

        </div>
      </div>

      {/* MODAL PIX ESPECÍFICO DA ETAPA LIBERADA */}
      {modalPixEtapa && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 space-y-5 text-center shadow-2xl animate-slide-up">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mx-auto font-bold">
              💸
            </div>
            <div>
              <span className="text-xs font-black text-emerald-600 uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-emerald-50">
                Pagamento Pix Liberado por Etapa
              </span>
              <h4 className="text-lg font-black text-slate-900 mt-2">{modalPixEtapa.titulo}</h4>
              <p className="text-xs text-slate-500 mt-1">Envie sua contribuição via Pix P2P direto ao prestador do bairro.</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <p className="text-xs text-slate-500 font-bold uppercase">Valor Recomendado da Etapa</p>
              <p className="text-3xl font-black text-slate-900">R$ {modalPixEtapa.valorCalculado.toFixed(2)}</p>
              <p className="text-xs text-emerald-700 font-bold pt-1">Chave Pix Direta: <span className="font-mono">{servico?.chavePixPrestador || '11987654321'}</span></p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col items-center gap-2">
              <QrCode size={120} className="text-slate-900" />
              <p className="text-[11px] text-slate-400 font-mono">00020126580014BR.GOV.BCB.PIX0136kuriocity-p2p-etapa</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(servico?.chavePixPrestador || '11987654321')
                  alert('Chave Pix copiada com sucesso!')
                }}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-colors"
              >
                Copiar Chave Pix
              </button>
              <button
                onClick={() => setModalPixEtapa(null)}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-colors"
              >
                Concluir Pagamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
