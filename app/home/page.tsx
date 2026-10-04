'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Inter } from 'next/font/google'
import { User, getRoleBadge } from '@/lib/types'
import { getCurrentUser, logoutUser } from '@/lib/auth'
import ModalAuthOnboarding from '@/components/ModalAuthOnboarding'
import KurioLogo from '@/components/KurioLogo'
import {
  MapPin,
  Menu,
  X,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  User as UserIcon,
  Footprints,
  Wrench,
  Store,
  FileText,
  Coins,
  ShieldCheck,
  Camera,
  LogOut,
} from 'lucide-react'

const inter = Inter({ subsets: ['latin'], display: 'swap' })
const CONTAINER_INNER = 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full'

export default function LandingPage() {
  const [user, setUser]           = useState<User>(() => getCurrentUser())
  const [modalAuth, setModalAuth] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeId, setActiveId]   = useState('')

  const badge = getRoleBadge(user.role)

  useEffect(() => {
    const ids = ['como-funciona', 'perfis', 'deducao-fiscal']
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActiveId(e.target.id)),
      { rootMargin: '-20% 0px -40% 0px', threshold: 0.1 }
    )
    ids.forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [])

  const nav = [
    { href: '#como-funciona', label: 'Como Funciona', id: 'como-funciona' },
    { href: '#perfis',        label: 'Os Perfis',     id: 'perfis'        },
    { href: '#deducao-fiscal',label: 'IPTU e Dossiê', id: 'deducao-fiscal'},
  ]

  const scroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith('#')) return
    e.preventDefault()
    document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.history.pushState(null, '', href)
    setMobileOpen(false)
  }

  return (
    <div className={`${inter.className} min-h-screen bg-slate-50/60 text-slate-900 antialiased selection:bg-blue-100`}>

      {/* ─────────── HEADER ─────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200/80">
        <div className={`${CONTAINER_INNER} h-16 flex items-center justify-between`}>

          <Link href="/" className="hover:opacity-90 transition-opacity shrink-0">
            <KurioLogo className="h-9" />
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {nav.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => scroll(e, link.href)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  activeId === link.id
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setModalAuth(true)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-xs font-semibold text-slate-700 transition-all shadow-xs"
            >
              <UserIcon size={14} className="text-blue-600" />
              <span>{user.nome.split(' ')[0]}</span>
            </button>

            <button
              onClick={() => {
                const u = logoutUser()
                setUser(u)
              }}
              title="Fazer Logoff / Sair da Conta"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-500 hover:text-red-600 text-xs font-semibold transition-all"
            >
              <LogOut size={14} />
              <span className="hidden md:inline">Sair</span>
            </button>

            <Link
              href="/"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm transition-all"
            >
              <MapPin size={14} />
              <span>Mapa</span>
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-200 px-4 pt-3 pb-5 space-y-1 bg-white">
            {nav.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => scroll(e, link.href)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {link.label}
                <ChevronRight size={15} className="text-slate-400" />
              </a>
            ))}
            <div className="pt-3 mt-2 border-t border-slate-100 space-y-2">
              <button
                onClick={() => { setMobileOpen(false); setModalAuth(true) }}
                className="w-full text-center py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700"
              >
                {badge.emoji} {badge.label} — Gerir Perfil
              </button>
              <button
                onClick={() => {
                  const u = logoutUser()
                  setUser(u)
                  setMobileOpen(false)
                }}
                className="w-full text-center py-2.5 rounded-lg border border-red-200 bg-red-50 text-red-600 text-sm font-bold flex items-center justify-center gap-2"
              >
                <LogOut size={15} />
                <span>Fazer Logoff</span>
              </button>
              <Link href="/" className="block text-center w-full py-2.5 rounded-lg bg-blue-600 text-white font-bold text-sm">
                Abrir Mapa Interativo
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ─────────── MAIN CONTAINER ─────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-12 md:space-y-16 py-8">

        {/* ─────────── HERO ─────────── */}
        <section className="py-10 md:py-14 space-y-8 border-b border-slate-200/80">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              Plataforma cívica P2P · LGPD · Pix direto
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Transforme a sua rua.<br />
              <span className="text-blue-600">Abata o seu IPTU.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              Plataforma cívica para reparar calçadas e buracos com doações
              Pix diretas entre vizinhos e abatimento fiscal automático.
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all"
              >
                <MapPin size={16} />
                <span>Explorar Mapa do Bairro</span>
                <ArrowRight size={15} />
              </Link>

              <a
                href="#como-funciona"
                onClick={(e) => scroll(e, '#como-funciona')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all shadow-xs"
              >
                Como Funciona
              </a>
            </div>
          </div>

          {/* Proof bar */}
          <div className="pt-6 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Pix 100% direto ao prestador',      icon: <Coins size={16} className="text-blue-600 shrink-0" /> },
              { label: 'Zero taxas de custódia',            icon: <ShieldCheck size={16} className="text-emerald-600 shrink-0" /> },
              { label: 'Comprovação por foto e vídeo',      icon: <Camera size={16} className="text-amber-600 shrink-0" /> },
              { label: 'Dossiê PDF para abatimento IPTU',   icon: <FileText size={16} className="text-purple-600 shrink-0" /> },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-xs text-sm text-slate-700 font-medium">
                {item.icon}
                <span className="truncate">{item.label}</span>
              </div>
            ))}
          </div>
        </section>


        {/* ─────────── COMO FUNCIONA ─────────── */}
        <section id="como-funciona" className="scroll-mt-20 py-10 md:py-14 space-y-8 border-b border-slate-200/80">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Como Funciona</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Três passos. Impacto real.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed pt-1">
              Da identificação do problema ao comprovante fiscal, tudo acontece dentro da plataforma.
            </p>
          </div>

          {/* Container dos 3 Passos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full">
            {[
              {
                num: '01',
                color: 'blue',
                icon: <MapPin size={22} />,
                title: 'Mapeie ou Apoie',
                desc: 'Identifique um problema na rua com GPS e foto, ou contribua com Pix direto para uma obra já ativa no mapa.',
              },
              {
                num: '02',
                color: 'amber',
                icon: <Camera size={22} />,
                title: 'Obra Executada',
                desc: 'O prestador local realiza o serviço e comprova cada etapa (30% → 40% → 30%) com fotos ou vídeo para a comunidade validar.',
              },
              {
                num: '03',
                color: 'emerald',
                icon: <FileText size={22} />,
                title: 'Abatimento no IPTU',
                desc: 'Receba o Dossiê Cívico em PDF guardado automaticamente no seu Google Drive para protocolo de crédito fiscal.',
              },
            ].map(({ num, color, icon, title, desc }, i) => {
              const palette: Record<string, { icon: string; num: string }> = {
                blue:   { icon: 'bg-blue-50 text-blue-600 border-blue-100',     num: 'text-blue-600'   },
                amber:  { icon: 'bg-amber-50 text-amber-600 border-amber-100',  num: 'text-amber-600'  },
                emerald:{ icon: 'bg-emerald-50 text-emerald-600 border-emerald-100', num: 'text-emerald-600' },
              }
              const s = palette[color]
              return (
                <div
                  key={i}
                  className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col justify-between h-full overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 space-y-6"
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-xl border ${s.icon} flex items-center justify-center shrink-0`}>
                      {icon}
                    </div>
                    <span className={`text-4xl font-black opacity-20 ${s.num}`}>{num}</span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Flow steps indicator */}
          <div className="p-6 md:p-8 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pagamento desbloqueado por etapa aprovada</p>
            <div className="flex flex-wrap items-center gap-3">
              {['Etapa 1 — Preparação (30%)', 'Etapa 2 — Execução (40%)', 'Etapa 3 — Finalização (30%)'].map((stepText, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span>{stepText}</span>
                  </div>
                  {i < 2 && <ChevronRight size={14} className="text-slate-300 shrink-0" />}
                </div>
              ))}
              <ArrowRight size={14} className="text-blue-500 shrink-0" />
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg">
                💸 Pix Liberado
              </div>
            </div>
          </div>
        </section>


        {/* ─────────── OS 3 PERFIS ─────────── */}
        <section id="perfis" className="scroll-mt-20 py-10 md:py-14 space-y-8 border-b border-slate-200/80">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Os Perfis</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Comece como morador.<br />Evolua quando quiser.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed pt-1">
              Todos os usuários iniciam como <strong className="text-slate-900">Morador / Cidadão</strong>.
              Os outros perfis são ativados voluntariamente no painel de conta.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full">
            {[
              {
                icon: <Footprints size={22} className="text-blue-600" />,
                iconBg: 'bg-blue-50 border-blue-100',
                tag: 'Perfil inicial — obrigatório',
                tagColor: 'text-blue-700 bg-blue-50 border-blue-200',
                title: 'Morador / Cidadão',
                desc: 'Registra problemas urbanos com GPS e foto. Apoia obras via Pix P2P. Recebe o Dossiê de IPTU automaticamente.',
                benefits: ['Mapear pontos de cuidado', 'Apoiar obras com Pix direto', 'Receber dossiê para IPTU'],
                cta: 'Cadastrar como Morador',
                ctaStyle: 'bg-blue-600 hover:bg-blue-700 text-white',
              },
              {
                icon: <Wrench size={22} className="text-amber-600" />,
                iconBg: 'bg-amber-50 border-amber-100',
                tag: 'Evolução opcional',
                tagColor: 'text-amber-700 bg-amber-50 border-amber-200',
                title: 'Prestador de Serviço',
                desc: 'Aceita obras próximas e comprova cada etapa com foto/vídeo. Recebe Pix direto após validação da comunidade.',
                benefits: ['Obras a metros de casa', 'Pix por etapa comprovada', 'Portfólio público no mapa'],
                cta: 'Ativar Modo Prestador',
                ctaStyle: 'bg-amber-500 hover:bg-amber-600 text-white',
              },
              {
                icon: <Store size={22} className="text-emerald-600" />,
                iconBg: 'bg-emerald-50 border-emerald-100',
                tag: 'Evolução opcional',
                tagColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
                title: 'Comércio Local',
                desc: 'Fornece materiais de construção com nota fiscal integrada ao Dossiê Cívico do doador para abatimento fiscal.',
                benefits: ['Cotações diretas no mapa', 'NF no dossiê de IPTU', 'Selo de Loja Parceira'],
                cta: 'Credenciar Minha Loja',
                ctaStyle: 'bg-emerald-600 hover:bg-emerald-700 text-white',
              },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col justify-between h-full overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-xl border ${card.iconBg} flex items-center justify-center shrink-0`}>
                      {card.icon}
                    </div>
                    <span className={`text-[11px] font-bold border px-2 py-0.5 rounded-md ${card.tagColor}`}>
                      {card.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 mb-2 tracking-tight">{card.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{card.desc}</p>
                  </div>

                  <ul className="space-y-2 pt-2">
                    {card.benefits.map((b, j) => (
                      <li key={j} className="flex items-center gap-2.5 text-sm text-slate-700 font-medium">
                        <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => setModalAuth(true)}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-bold transition-all ${card.ctaStyle} shadow-xs`}
                >
                  {card.cta}
                </button>
              </div>
            ))}
          </div>
        </section>


        {/* ─────────── IPTU & DOSSIÊ ─────────── */}
        <section id="deducao-fiscal" className="scroll-mt-20 py-10 md:py-14 space-y-8">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 lg:p-12 text-white space-y-10 shadow-xl">
            
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">IPTU e Dossiê Cívico</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Do Pix ao abatimento de IPTU,<br />
                <span className="text-blue-400">tudo automático.</span>
              </h2>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed pt-1">
                Cada centavo doado gera comprovação e mídias salvas diretamente no Google Drive do doador.
                Zero dados retidos pela plataforma.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full">
              {[
                {
                  n: '01', icon: <ShieldCheck size={20} className="text-blue-400" />,
                  t: 'Zero Custódia',
                  badge: 'Google Drive pessoal (LGPD)',
                  d: 'Fotos e comprovantes Pix salvos na pasta pessoal do morador. A plataforma não armazena dados fiscais.',
                  pts: ['Escopo drive.file mínimo', 'Sem servidor intermediário', 'Controle total do titular'],
                },
                {
                  n: '02', icon: <FileText size={20} className="text-purple-400" />,
                  t: 'Dossiê Cívico PDF',
                  badge: 'Autenticado por GPS',
                  d: 'PDF com geolocalização, fotos Antes/Depois, notas fiscais das lojas e comprovantes Pix P2P.',
                  pts: ['Protocolo único por Ponto', 'Comprovação visual e GPS', 'NF de loja local anexada'],
                },
                {
                  n: '03', icon: <Coins size={20} className="text-emerald-400" />,
                  t: 'Crédito no IPTU',
                  badge: 'Legislação municipal',
                  d: 'O morador protocola o Dossiê na Prefeitura para solicitar crédito proporcional no imposto predial.',
                  pts: ['Até R$ 1.890 economizados', 'Embasamento jurídico incluso', 'Protocolo digital válido'],
                },
              ].map((s, i) => (
                <div key={i} className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 md:p-8 flex flex-col justify-between h-full space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center font-black text-sm text-white shrink-0">
                        {s.n}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {s.icon}
                        <span className="text-[11px] font-semibold text-slate-300 bg-slate-700/80 px-2 py-0.5 rounded-md">{s.badge}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-base mb-1">{s.t}</h3>
                      <p className="text-sm text-slate-300 leading-relaxed">{s.d}</p>
                    </div>
                  </div>

                  <ul className="space-y-2 pt-4 border-t border-slate-700/80">
                    {s.pts.map((p, j) => (
                      <li key={j} className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Example calculation */}
            <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700/80">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Exemplo de compensação tributária</p>
                  <h4 className="text-base font-extrabold text-white">Ponto #17 — Calçada com Piso Tátil, Centro</h4>
                </div>
                <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg self-start sm:self-auto">
                  DOSSIÊ-IPTU-17-1280
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { l: 'Investimento comunitário',    v: 'R$ 420,00',  s: 'Via Pix P2P entre vizinhos',      c: 'text-emerald-400' },
                  { l: 'Economia pública estimada',   v: 'R$ 1.890,00',s: 'vs. orçamento de licitação',     c: 'text-blue-400'    },
                  { l: 'Retorno ao doador no IPTU',   v: 'Até 100%',   s: 'Proporcional ao valor doado',    c: 'text-purple-400'  },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 space-y-1">
                    <p className="text-xs text-slate-400 font-semibold">{item.l}</p>
                    <p className={`text-2xl font-black ${item.c}`}>{item.v}</p>
                    <p className="text-xs text-slate-400">{item.s}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* ─────────── FOOTER ─────────── */}
      <footer className="py-10 bg-white border-t border-slate-200/80 mt-12">
        <div className={`${CONTAINER_INNER} flex flex-col sm:flex-row items-center justify-between gap-5`}>
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <KurioLogo className="h-9" />
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600 font-semibold">
            <Link href="/" className="hover:text-slate-900 transition-colors">Mapa do Bairro</Link>
            {nav.map((link) => (
              <a key={link.id} href={link.href} onClick={(e) => scroll(e, link.href)} className="hover:text-slate-900 transition-colors">
                {link.label}
              </a>
            ))}
          </div>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm transition-all"
          >
            <MapPin size={14} />
            <span>Abrir Mapa</span>
          </Link>
        </div>
      </footer>

      {modalAuth && <ModalAuthOnboarding onClose={() => setModalAuth(false)} onSuccess={(u) => setUser(u)} />}
    </div>
  )
}
