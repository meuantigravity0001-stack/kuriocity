'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { PontoDeCuidado, User, getStatusConfig, getRoleBadge } from '@/lib/types'
import { getCurrentUser, logoutUser } from '@/lib/auth'
import ModalPontoCuidado from '@/components/ModalPontoCuidado'
import ModalContribuicaoPix from '@/components/ModalContribuicaoPix'
import ModalProofOfWork from '@/components/ModalProofOfWork'
import ModalDossieIPTU from '@/components/ModalDossieIPTU'
import ModalAuthOnboarding from '@/components/ModalAuthOnboarding'
import KurioLogo from '@/components/KurioLogo'
import {
  PlusCircle,
  RefreshCw,
  ChevronRight,
  Crosshair,
  Radio,
  Store,
  HardHat,
  FileText,
  Heart,
  ShieldCheck,
  Award,
  Users,
  HelpCircle,
  UserCheck,
  User as UserIcon,
  LogOut,
} from 'lucide-react'

// Mapa sem SSR — Leaflet só roda no browser
const TabuleiroDinamico = dynamic(() => import('@/components/TabuleiroDinamico'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
      <div className="text-center space-y-3">
        <div
          className="w-12 h-12 rounded-full border-4 border-slate-300 mx-auto animate-spin"
          style={{ borderTopColor: '#2563eb' }}
        />
        <p className="text-slate-600 text-xs tracking-wider font-semibold uppercase">Carregando Mapa do Bairro...</p>
      </div>
    </div>
  ),
})

export default function HomePage() {
  const [user, setUser] = useState<User>(() => getCurrentUser())
  const [pontos, setPontos] = useState<PontoDeCuidado[]>([])
  const [modalNovoPonto, setModalNovoPonto] = useState(false)
  const [pontoSelecionado, setPontoSelecionado] = useState<PontoDeCuidado | null>(null)
  
  // Modais de Ação Kuriocity 2.1
  const [modalAuth, setModalAuth] = useState(false)
  const [modalPixP2P, setModalPixP2P] = useState(false)
  const [modalProofOfWork, setModalProofOfWork] = useState(false)
  const [modalDossieIPTU, setModalDossieIPTU] = useState(false)

  const [loading, setLoading] = useState(true)
  const [feedAberto, setFeedAberto] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS')

  const carregarPontos = useCallback(async () => {
    try {
      const res = await fetch('/api/pontos-cuidado')
      const data = await res.json()
      if (data.pontos) setPontos(data.pontos)
    } catch (err) {
      console.error('Erro ao carregar pontos de cuidado:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregarPontos()
    const interval = setInterval(carregarPontos, 30000)
    return () => clearInterval(interval)
  }, [carregarPontos])

  const pontosFiltrados = pontos.filter((p) => {
    if (filtroStatus === 'TODOS') return true
    return p.status === filtroStatus
  })

  const stats = {
    total: pontos.length,
    mapeado: pontos.filter((p) => p.status === 'ABERTO').length,
    arrecadacao: pontos.filter((p) => p.status === 'EM_ARRECADACAO').length,
    execucao: pontos.filter((p) => p.status === 'EM_EXECUCAO').length,
    concluido: pontos.filter((p) => p.status === 'CONCLUIDO').length,
  }

  const roleBadge = getRoleBadge(user.role)

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-100 font-sans text-slate-900">
      {/* ── MAPA DE FUNDO ── */}
      <div className="absolute inset-0 z-0">
        <TabuleiroDinamico
          pontos={pontosFiltrados}
          pontoSelecionado={pontoSelecionado}
          onMarkerClick={(p) => {
            setPontoSelecionado(p)
            setFeedAberto(true)
          }}
        />
      </div>

      {/* ══════════════════════════════════════════
          HUD SUPERIOR — Header com Autenticação e Perfil (Role)
      ══════════════════════════════════════════ */}
      <header
        className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3 py-2 md:px-6 md:py-3.5 shadow-md backdrop-blur-xl bg-white/95 border-b border-slate-200/80"
      >
        {/* Logo & Tagline */}
        <Link href="/home" className="hover:opacity-90 transition-opacity">
          <KurioLogo className="h-7 md:h-9" />
        </Link>

        {/* User Profile Badge & Role Selector */}
        <div className="flex items-center gap-1.5 md:gap-2.5">
          {/* Badge Perfil de Atuação */}
          <button
            onClick={() => setModalAuth(true)}
            className={`flex items-center gap-1 md:gap-2 px-2 py-1 md:px-3 md:py-1.5 rounded-xl border text-[11px] md:text-xs font-semibold shadow-sm transition-all hover:scale-105 ${roleBadge.badgeClass}`}
            title="Clique para alterar seu modo de atuação (Cidadão / Loja / Prestador)"
          >
            <span>{roleBadge.emoji}</span>
            <span className="hidden md:inline">{roleBadge.label}</span>
          </button>

          {/* User Avatar */}
          <button
            onClick={() => setModalAuth(true)}
            className="flex items-center gap-1 md:gap-2 p-1 rounded-xl hover:bg-slate-100 transition-all border border-slate-200"
          >
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.nome} className="w-6 h-6 md:w-7 md:h-7 rounded-lg object-cover" />
            ) : (
              <div className="w-6 h-6 md:w-7 md:h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <UserIcon size={14} />
              </div>
            )}
            <span className="text-xs font-bold text-slate-800 hidden md:inline pr-1">{user.nome}</span>
          </button>

          {/* Logoff Button */}
          <button
            onClick={() => {
              const u = logoutUser()
              setUser(u)
            }}
            title="Fazer Logoff / Sair da Conta"
            className="flex items-center gap-1 px-2 py-1 md:px-2.5 md:py-1.5 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-600 hover:text-red-600 text-[11px] md:text-xs font-semibold transition-all bg-white shadow-xs"
          >
            <LogOut size={13} className="text-red-500" />
            <span className="hidden md:inline">Sair</span>
          </button>

          <Link
            href="/home"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-all shadow-sm"
          >
            <HelpCircle size={14} className="text-blue-600" />
            <span>Apresentação</span>
          </Link>

          <button
            onClick={carregarPontos}
            className="w-7 h-7 md:w-8 md:h-8 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition-all text-slate-600 border border-slate-300/70 shadow-sm"
            title="Atualizar mapa"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════
          MOBILE FILTERS BAR — Pill Bar Compacta (Mobile Only < 768px)
      ══════════════════════════════════════════ */}
      <div className="md:hidden absolute top-14 left-2 right-2 z-20 flex items-center gap-1.5 overflow-x-auto p-1.5 bg-white/95 backdrop-blur-xl rounded-2xl shadow-md border border-slate-200/90 no-scrollbar">
        {[
          { id: 'TODOS', label: 'Todos', count: stats.total, color: '#475569' },
          { id: 'EM_ARRECADACAO', label: '🔵 Pix', count: stats.arrecadacao, color: '#2563eb' },
          { id: 'EM_EXECUCAO', label: '🟡 Obra', count: stats.execucao, color: '#d97706' },
          { id: 'CONCLUIDO', label: '🟢 Vitórias', count: stats.concluido, color: '#16a34a' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFiltroStatus(f.id)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 transition-all ${
              filtroStatus === f.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}

        <button
          onClick={() => setModalDossieIPTU(true)}
          className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 shrink-0 flex items-center gap-1"
        >
          <FileText size={12} /> IPTU
        </button>
      </div>

      {/* ══════════════════════════════════════════
          DESKTOP HUD ESQUERDO — Painel de Controle (Desktop Only >= 768px)
      ══════════════════════════════════════════ */}
      <div className="hidden md:block absolute top-24 left-5 z-20 w-60 space-y-3">
        {/* Card principal de zeladoria */}
        <div
          className="rounded-2xl p-4 space-y-3.5 bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crosshair size={15} className="text-blue-600" />
              <span className="text-xs font-bold tracking-wide uppercase text-slate-700">
                Pontos de Cuidado
              </span>
            </div>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck size={12} /> LGPD
            </span>
          </div>

          {/* Filtros por status */}
          <div className="space-y-1">
            {[
              { id: 'TODOS', label: 'Todos os Pontos', count: stats.total, color: '#475569' },
              { id: 'EM_ARRECADACAO', label: 'Em Arrecadação Pix', count: stats.arrecadacao, color: '#2563eb' },
              { id: 'EM_EXECUCAO', label: 'Em Execução Obra', count: stats.execucao, color: '#d97706' },
              { id: 'CONCLUIDO', label: 'Vitórias Comunitárias', count: stats.concluido, color: '#16a34a' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFiltroStatus(f.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  filtroStatus === f.id
                    ? 'bg-blue-50 border border-blue-200 text-blue-700 font-bold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: f.color }} />
                  <span>{f.label}</span>
                </div>
                <span className="text-xs font-mono font-bold" style={{ color: f.color }}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Card Dossiê IPTU Clean */}
        <div
          className="rounded-2xl p-4 space-y-1.5 bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-lg"
        >
          <p className="text-xs font-bold tracking-wide uppercase text-purple-700 flex items-center gap-1.5">
            <FileText size={14} /> Abatimento de IPTU
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            Emita o Dossiê Cívico com recibos no seu Google Drive para abatimento do IPTU municipal.
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          FAB — Botão Mapear Ponto de Cuidado
      ══════════════════════════════════════════ */}
      <button
        onClick={() => setModalNovoPonto(true)}
        className="absolute bottom-20 right-3 md:bottom-24 md:right-6 z-20 flex items-center gap-1.5 md:gap-2.5 px-3.5 py-2.5 md:px-6 md:py-4 rounded-full md:rounded-2xl font-bold text-xs md:text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-2xl transition-all hover:scale-105 active:scale-95 border border-blue-500/30"
      >
        <PlusCircle size={18} />
        <span>
          <span className="md:hidden">Mapear</span>
          <span className="hidden md:inline">Mapear Ponto de Cuidado</span>
        </span>
        <ChevronRight size={15} className="hidden md:inline" />
      </button>

      {/* ══════════════════════════════════════════
          HUD INFERIOR — Feed da Vizinhança
      ══════════════════════════════════════════ */}
      <div
        className="absolute bottom-0 left-0 right-0 z-30 transition-all duration-300 ease-out"
        style={{ transform: feedAberto ? 'translateY(0)' : 'translateY(calc(100% - 56px))' }}
      >
        {/* Handle / Toggle */}
        <button
          onClick={() => setFeedAberto((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-3 md:px-6 md:py-4 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-2xl"
        >
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <Radio size={14} className="text-blue-600 animate-pulse shrink-0" />
            <span className="text-[11px] md:text-xs font-bold tracking-wide uppercase text-slate-800 truncate">
              <span className="md:hidden">Feed do Bairro</span>
              <span className="hidden md:inline">Feed de Zeladoria & Comércios do Bairro</span>
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <span
              className="text-[10px] md:text-xs font-mono font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200"
            >
              <span className="md:hidden">{pontosFiltrados.length} no bairro</span>
              <span className="hidden md:inline">{pontosFiltrados.length} pontos no bairro</span>
            </span>
            <ChevronRight
              size={16}
              className="text-slate-500 transition-transform duration-300"
              style={{ transform: feedAberto ? 'rotate(-90deg)' : 'rotate(90deg)' }}
            />
          </div>
        </button>

        {/* Lista de Pontos de Cuidado */}
        <div
          className="overflow-y-auto bg-slate-50/98 backdrop-blur-xl pb-6"
          style={{
            maxHeight: '44vh',
          }}
        >
          {pontosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-8">
              <span className="text-3xl mb-3">🌱</span>
              <p className="text-slate-800 text-sm font-bold">Nenhum Ponto de Cuidado nesta categoria</p>
              <p className="text-slate-500 text-xs mt-1">Mapeie um reparo comunitário na sua vizinhança!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200/80">
              {pontosFiltrados.map((p) => (
                <PontoRow
                  key={p.id}
                  ponto={p}
                  isSelected={pontoSelecionado?.id === p.id}
                  onClick={() => setPontoSelecionado(p)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MODAIS & DRAWERS DE AÇÃO
      ══════════════════════════════════════════ */}
      {modalAuth && (
        <ModalAuthOnboarding
          onClose={() => setModalAuth(false)}
          onSuccess={(u) => setUser(u)}
        />
      )}

      {modalNovoPonto && (
        <ModalPontoCuidado
          onClose={() => setModalNovoPonto(false)}
          onSuccess={carregarPontos}
        />
      )}

      {pontoSelecionado && (
        <DetalheDrawer
          ponto={pontoSelecionado}
          user={user}
          onClose={() => setPontoSelecionado(null)}
          onAbrirPix={() => setModalPixP2P(true)}
          onAbrirProof={() => setModalProofOfWork(true)}
          onAbrirDossie={() => setModalDossieIPTU(true)}
          onAbrirAuth={() => setModalAuth(true)}
        />
      )}

      {modalPixP2P && pontoSelecionado && (
        <ModalContribuicaoPix
          ponto={pontoSelecionado}
          onClose={() => setModalPixP2P(false)}
          onSuccess={() => {
            carregarPontos()
            setModalPixP2P(false)
          }}
        />
      )}

      {modalProofOfWork && pontoSelecionado && (
        <ModalProofOfWork
          ponto={pontoSelecionado}
          onClose={() => setModalProofOfWork(false)}
          onSuccess={() => {
            carregarPontos()
            setModalProofOfWork(false)
          }}
        />
      )}

      {modalDossieIPTU && pontoSelecionado && (
        <ModalDossieIPTU
          ponto={pontoSelecionado}
          onClose={() => setModalDossieIPTU(false)}
        />
      )}
    </div>
  )
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

function PontoRow({
  ponto, isSelected, onClick,
}: { ponto: PontoDeCuidado; isSelected: boolean; onClick: () => void }) {
  const status = getStatusConfig(ponto.status)
  const meta = ponto.orcamentoLoja?.valorTotal || 0
  const arrecadado = ponto.orcamentoLoja?.valorArrecadado || 0
  const pct = meta > 0 ? Math.min(100, Math.round((arrecadado / meta) * 100)) : 0

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-6 py-4 flex items-center gap-4 transition-all hover:bg-slate-100/80 ${
        isSelected ? 'bg-blue-50/90 border-l-4 border-blue-600' : ''
      }`}
    >
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 bg-slate-100 border border-slate-200 shadow-sm"
      >
        🌱
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${status.badgeClass}`}>
            {status.emoji} {status.label}
          </span>
          <span className="text-xs text-slate-500 ml-auto font-medium">{ponto.cidade}</span>
        </div>
        <p className="text-sm text-slate-900 font-bold truncate">{ponto.titulo}</p>
        <p className="text-xs text-slate-500 truncate mt-0.5">{ponto.endereco}</p>

        {meta > 0 && (
          <div className="mt-2 flex items-center gap-3">
            <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-600 h-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-mono text-blue-700 font-bold">{pct}%</span>
          </div>
        )}
      </div>
    </button>
  )
}

function DetalheDrawer({
  ponto,
  user,
  onClose,
  onAbrirPix,
  onAbrirProof,
  onAbrirDossie,
  onAbrirAuth,
}: {
  ponto: PontoDeCuidado
  user: User
  onClose: () => void
  onAbrirPix: () => void
  onAbrirProof: () => void
  onAbrirDossie: () => void
  onAbrirAuth: () => void
}) {
  const status = getStatusConfig(ponto.status)
  const meta = ponto.orcamentoLoja?.valorTotal || 0
  const arrecadado = ponto.orcamentoLoja?.valorArrecadado || 0
  const pct = meta > 0 ? Math.min(100, Math.round((arrecadado / meta) * 100)) : 0

  return (
    <div
      className="absolute top-0 right-0 bottom-0 z-40 w-full sm:w-[440px] overflow-y-auto bg-white/98 backdrop-blur-2xl border-l border-slate-200 shadow-2xl"
    >
      {/* Header */}
      <div
        className="sticky top-0 flex items-center justify-between px-6 py-4 z-10 bg-white/95 border-b border-slate-200 shadow-sm"
      >
        <div className="pr-4 min-w-0">
          <p className="text-sm font-bold text-slate-900 truncate">Detalhes da Zeladoria</p>
          <p className="text-xs text-slate-500 font-medium">Kurió City Tour — Conexão de Vizinhança</p>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 ml-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200/80 flex items-center justify-center text-slate-600 text-sm font-bold transition-all shadow-sm shrink-0"
          title="Fechar painel"
        >
          ✕
        </button>
      </div>

      <div className="p-6 space-y-5">
        {/* Status Badge */}
        <div className={`p-4 rounded-2xl border ${status.badgeClass} flex items-center gap-3 shadow-sm`}>
          <div className="w-3.5 h-3.5 rounded-full animate-pulse shrink-0" style={{ background: status.color }} />
          <div>
            <p className="font-bold text-xs">{status.emoji} {status.label}</p>
            <p className="text-xs mt-0.5 font-medium leading-relaxed opacity-95">{status.desc}</p>
          </div>
        </div>

        {/* Foto */}
        {ponto.fotoUrl && (
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md">
            <img src={ponto.fotoUrl} alt="Foto do Ponto" className="w-full h-52 object-cover" />
          </div>
        )}

        {/* Título & Descrição */}
        <div className="space-y-1.5">
          <h2 className="text-slate-900 font-bold text-lg leading-snug">{ponto.titulo}</h2>
          <p className="text-xs text-slate-600 leading-relaxed">{ponto.descricao}</p>
          <p className="text-xs text-blue-700 mt-2 flex items-center gap-1 font-mono font-semibold">
            📍 {ponto.endereco || 'Endereço registrado via GPS'} ({ponto.cidade})
          </p>
        </div>

        {/* Adaptação por Role COMERCIANTE */}
        {user.role === 'COMERCIANTE' && !ponto.orcamentoLoja && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Store size={15} /> Modo Comerciante Ativo
            </p>
            <p className="text-xs text-amber-800 leading-relaxed">
              Você pode enviar um orçamento de materiais para este Ponto de Cuidado no raio da sua loja ({user.nomeLoja || 'Sua Loja'}).
            </p>
            <button
              onClick={() => alert(`Orçamento da loja ${user.nomeLoja || 'Parceira'} vinculado a este Ponto!`)}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
            >
              + Enviar Orçamento de Materiais
            </button>
          </div>
        )}

        {/* Progresso de Arrecadação Lojista */}
        {ponto.orcamentoLoja && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Store size={15} className="text-blue-600" /> {ponto.orcamentoLoja.nomeLoja}
              </span>
              <span className="text-xs font-mono font-bold text-blue-700">
                R$ {arrecadado.toFixed(2)} / R$ {meta.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-slate-600">📦 {ponto.orcamentoLoja.itensDescricao}</p>
            <div className="bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div className="bg-blue-600 h-full transition-all" style={{ width: `${pct}%` }} />
            </div>

            <button
              onClick={onAbrirPix}
              className="w-full mt-2 py-3.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Heart size={15} /> Contribuir Direto via Pix P2P
            </button>
          </div>
        )}

        {/* Adaptação por Role PRESTADOR */}
        {user.role === 'PRESTADOR' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <HardHat size={15} /> Modo Prestador de Serviço Ativo
            </p>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Candidate-se para executar esta obra, registre seu Check-in GPS e fortaleça seu portfólio no bairro.
            </p>
            <button
              onClick={onAbrirProof}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              🛠️ Candidatar-se / Registrar Check-in GPS
            </button>
          </div>
        )}

        {/* Mão de Obra Local */}
        {ponto.servicoMaoObra && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <HardHat size={15} className="text-emerald-600" /> {ponto.servicoMaoObra.prestadorNome}
              </span>
              <span className="text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <Award size={12} /> {ponto.servicoMaoObra.reputacaoNivel}
              </span>
            </div>
            <p className="text-xs text-slate-700">
              Valor Acordado: <strong className="text-emerald-700">R$ {ponto.servicoMaoObra.valorAcordado.toFixed(2)}</strong>
            </p>
            <p className="text-xs text-purple-800 flex items-center gap-1.5 font-semibold">
              <Users size={14} /> {ponto.servicoMaoObra.votosAprovacao} vizinhos já validaram esta manutenção
            </p>

            <button
              onClick={onAbrirProof}
              className="w-full mt-2 py-3.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <HardHat size={15} /> Prova de Trabalho & Validar Obra
            </button>
          </div>
        )}

        {/* Botão Dossiê IPTU */}
        <button
          onClick={onAbrirDossie}
          className="w-full py-3.5 rounded-2xl font-bold text-xs bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <FileText size={16} /> Gerar Dossiê Cívico para Abatimento IPTU
        </button>

        {/* Transparência & Link Google Drive */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Custódia & LGPD (Privacy by Design)
          </p>
          <a
            href={ponto.driveFolderUrl || 'https://drive.google.com'}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-700 underline flex items-center gap-1.5 font-mono truncate hover:text-blue-800"
          >
            <ShieldCheck size={15} /> Ver Pasta no Google Drive Pessoal
          </a>
        </div>
      </div>
    </div>
  )
}
